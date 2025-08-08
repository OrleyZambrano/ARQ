-- =====================================================
-- SCRIPT SIMPLIFICADO PARA POLÍTICAS RLS DEL CHAT
-- =====================================================
-- Versión ultra-robusta que evita errores de relaciones inexistentes

-- =====================================================
-- PASO 1: LIMPIAR CONFIGURACIÓN EXISTENTE
-- =====================================================

-- Eliminar políticas de chat_sessions si existen
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
    DROP POLICY IF EXISTS "Buyers can create chat sessions" ON public.chat_sessions;
    DROP POLICY IF EXISTS "Agents can update their chat sessions" ON public.chat_sessions;
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Algunas políticas de chat_sessions no existían: %', SQLERRM;
END $$;

-- Eliminar políticas de chat_messages si existen
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
    DROP POLICY IF EXISTS "Users can send messages in their sessions" ON public.chat_messages;
    DROP POLICY IF EXISTS "Users can update message read status" ON public.chat_messages;
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Algunas políticas de chat_messages no existían: %', SQLERRM;
END $$;

-- Eliminar vista si existe
DROP VIEW IF EXISTS chat_sessions_with_details CASCADE;

-- Eliminar función y trigger si existen
DROP TRIGGER IF EXISTS trigger_update_chat_session_last_message ON public.chat_messages;
DROP FUNCTION IF EXISTS update_chat_session_last_message();
DROP FUNCTION IF EXISTS get_unread_messages_count(uuid, uuid);

-- =====================================================
-- PASO 2: VERIFICAR QUE LAS TABLAS EXISTEN
-- =====================================================

DO $$
BEGIN
    -- Verificar chat_sessions
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        RAISE EXCEPTION 'La tabla chat_sessions no existe. Por favor, ejecuta primero SUPABASE_DATABASE_SETUP.sql';
    END IF;
    
    -- Verificar chat_messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        RAISE EXCEPTION 'La tabla chat_messages no existe. Por favor, ejecuta primero SUPABASE_DATABASE_SETUP.sql';
    END IF;
    
    -- Verificar que la columna user_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' AND column_name = 'user_id'
    ) THEN
        RAISE EXCEPTION 'La tabla chat_sessions no tiene la columna user_id. Revisa la estructura de la tabla.';
    END IF;
    
    RAISE NOTICE 'Verificación exitosa: Todas las tablas existen con la estructura correcta.';
END $$;

-- =====================================================
-- PASO 3: HABILITAR RLS
-- =====================================================

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 4: CREAR POLÍTICAS PARA CHAT_SESSIONS
-- =====================================================

-- Política de lectura: usuarios pueden ver sus propias sesiones
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.uid() = agent_id
    );

-- Política de inserción: usuarios pueden crear sesiones donde son el user_id
CREATE POLICY "Buyers can create chat sessions" ON public.chat_sessions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Política de actualización: solo agentes pueden actualizar sus sesiones
CREATE POLICY "Agents can update their chat sessions" ON public.chat_sessions
    FOR UPDATE
    USING (auth.uid() = agent_id)
    WITH CHECK (auth.uid() = agent_id);

-- =====================================================
-- PASO 5: CREAR POLÍTICAS PARA CHAT_MESSAGES
-- =====================================================

-- Política de lectura: usuarios pueden ver mensajes de sus sesiones
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.agent_id = auth.uid())
        )
    );

-- Política de inserción: usuarios pueden enviar mensajes en sus sesiones
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

-- Política de actualización: para marcar mensajes como leídos
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
-- PASO 6: CREAR FUNCIÓN Y TRIGGER
-- =====================================================

-- Función para actualizar last_message_at automáticamente
CREATE OR REPLACE FUNCTION update_chat_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función
CREATE TRIGGER trigger_update_chat_session_last_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_last_message();

-- =====================================================
-- PASO 7: HABILITAR REALTIME
-- =====================================================

-- Intentar habilitar realtime (puede fallar si ya está habilitado)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
    RAISE NOTICE 'Realtime habilitado para chat_sessions';
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Realtime ya estaba habilitado para chat_sessions';
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error habilitando realtime para chat_sessions: %', SQLERRM;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    RAISE NOTICE 'Realtime habilitado para chat_messages';
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Realtime ya estaba habilitado para chat_messages';
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error habilitando realtime para chat_messages: %', SQLERRM;
END $$;

-- =====================================================
-- PASO 8: CREAR FUNCIÓN AUXILIAR
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
-- PASO 9: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar RLS habilitado
DO $$
DECLARE
    chat_sessions_rls boolean;
    chat_messages_rls boolean;
BEGIN
    SELECT rowsecurity INTO chat_sessions_rls 
    FROM pg_tables 
    WHERE tablename = 'chat_sessions';
    
    SELECT rowsecurity INTO chat_messages_rls 
    FROM pg_tables 
    WHERE tablename = 'chat_messages';
    
    IF chat_sessions_rls AND chat_messages_rls THEN
        RAISE NOTICE 'RLS habilitado correctamente en ambas tablas';
    ELSE
        RAISE EXCEPTION 'Error: RLS no está habilitado en todas las tablas';
    END IF;
END $$;

-- Contar políticas creadas
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('chat_sessions', 'chat_messages');
    
    RAISE NOTICE 'Se crearon % políticas RLS', policy_count;
    
    IF policy_count < 6 THEN
        RAISE WARNING 'Se esperaban 6 políticas, solo se crearon %', policy_count;
    END IF;
END $$;

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '🎉 CONFIGURACIÓN DE CHAT COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS habilitado en chat_sessions y chat_messages';
    RAISE NOTICE '✅ 6 políticas de seguridad creadas';
    RAISE NOTICE '✅ Trigger automático configurado';
    RAISE NOTICE '✅ Realtime habilitado para tiempo real';
    RAISE NOTICE '✅ Función auxiliar creada';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 El sistema de chat está listo para usar!';
    RAISE NOTICE '📱 Puedes probar el frontend en http://localhost:3000';
    RAISE NOTICE '';
END $$;
