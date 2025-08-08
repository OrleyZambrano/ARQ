-- =====================================================
-- SCRIPT CORREGIDO PARA POLÍTICAS RLS DEL CHAT
-- =====================================================
-- Este script corrige el problema de usar user_id en lugar de buyer_id

-- Primero, eliminar políticas existentes si existen (para evitar errores)
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Buyers can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Agents can update their chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update message read status" ON public.chat_messages;

-- Eliminar vista existente si existe (y su política)
DROP VIEW IF EXISTS chat_sessions_with_details CASCADE;

-- Eliminar trigger y función existentes si existen
DROP TRIGGER IF EXISTS trigger_update_chat_session_last_message ON public.chat_messages;
DROP FUNCTION IF EXISTS update_chat_session_last_message();
DROP FUNCTION IF EXISTS get_unread_messages_count(uuid, uuid);

-- =====================================================
-- HABILITAR RLS EN LAS TABLAS DE CHAT
-- =====================================================

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA CHAT_SESSIONS (CORREGIDAS CON user_id)
-- =====================================================

-- Los usuarios pueden ver sesiones donde son participantes (comprador o agente)
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.uid() = agent_id
    );

-- Los compradores pueden crear nuevas sesiones
CREATE POLICY "Buyers can create chat sessions" ON public.chat_sessions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Los agentes pueden actualizar el estado de las sesiones donde participan
CREATE POLICY "Agents can update their chat sessions" ON public.chat_sessions
    FOR UPDATE
    USING (auth.uid() = agent_id)
    WITH CHECK (auth.uid() = agent_id);

-- =====================================================
-- POLÍTICAS PARA CHAT_MESSAGES (CORREGIDAS CON user_id)
-- =====================================================

-- Los usuarios pueden ver mensajes de sesiones donde participan
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.agent_id = auth.uid())
        )
    );

-- Los usuarios pueden enviar mensajes en sesiones donde participan
CREATE POLICY "Users can send messages in their sessions" ON public.chat_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.agent_id = auth.uid())
        )
    );

-- Los usuarios pueden actualizar sus propios mensajes (para marcar como leído)
CREATE POLICY "Users can update message read status" ON public.chat_messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.agent_id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.agent_id = auth.uid())
        )
    );

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR LAST_MESSAGE_AT
-- =====================================================

-- Función que se ejecuta automáticamente cuando se inserta un mensaje
CREATE OR REPLACE FUNCTION update_chat_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar automáticamente last_message_at
CREATE TRIGGER trigger_update_chat_session_last_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_last_message();

-- =====================================================
-- HABILITAR REALTIME PARA LAS TABLAS DE CHAT
-- =====================================================

-- Habilitar realtime para chat_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;

-- Habilitar realtime para chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- =====================================================
-- FUNCIÓN PARA OBTENER CONTEO DE MENSAJES NO LEÍDOS
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_messages_count(session_id uuid, user_id uuid)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.chat_messages cm
        WHERE cm.session_id = $1
        AND cm.sender_id != $2
        AND cm.is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VISTA PARA SESIONES CON INFORMACIÓN COMPLETA (CORREGIDA)
-- =====================================================

CREATE OR REPLACE VIEW chat_sessions_with_details AS
SELECT 
    cs.*,
    p.title as property_title,
    p.price as property_price,
    p.images as property_images,
    buyer.full_name as buyer_name,
    buyer.avatar_url as buyer_avatar,
    agent.full_name as agent_name,
    agent.avatar_url as agent_avatar,
    (
        SELECT COUNT(*)::INTEGER
        FROM public.chat_messages cm
        WHERE cm.session_id = cs.id
        AND cm.is_read = false
    ) as total_unread_count
FROM public.chat_sessions cs
LEFT JOIN public.properties p ON p.id = cs.property_id
LEFT JOIN public.user_profiles buyer ON buyer.id = cs.user_id
LEFT JOIN public.user_profiles agent ON agent.id = cs.agent_id;

-- Dar permisos de lectura en la vista
GRANT SELECT ON chat_sessions_with_details TO authenticated;

-- =====================================================
-- VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================

-- Verificar que las tablas tienen RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('chat_sessions', 'chat_messages');

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('chat_sessions', 'chat_messages');

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Chat RLS policies configured successfully!';
    RAISE NOTICE 'Tables: chat_sessions, chat_messages';
    RAISE NOTICE 'Realtime: Enabled';
    RAISE NOTICE 'Frontend: Ready to use';
END
$$;
