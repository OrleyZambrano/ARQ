-- =====================================================
-- CONFIGURACIÓN RLS PARA SISTEMA DE CHAT
-- ESTRUCTURA CORREGIDA PARA TU BASE DE DATOS
-- =====================================================

-- =====================================================
-- PASO 1: VERIFICAR ESTRUCTURA EXISTENTE
-- =====================================================

DO $$
DECLARE
    conversations_exists boolean := false;
    sessions_exists boolean := false;
    messages_exists boolean := false;
BEGIN
    -- Verificar qué tablas existen
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'chat_conversations' AND table_schema = 'public'
    ) INTO conversations_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'chat_sessions' AND table_schema = 'public'
    ) INTO sessions_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'chat_messages' AND table_schema = 'public'
    ) INTO messages_exists;
    
    RAISE NOTICE 'ESTRUCTURA DETECTADA:';
    RAISE NOTICE '- chat_conversations: %', conversations_exists;
    RAISE NOTICE '- chat_sessions: %', sessions_exists;
    RAISE NOTICE '- chat_messages: %', messages_exists;
    
    IF NOT conversations_exists THEN
        RAISE EXCEPTION 'La tabla chat_conversations no existe. Estructura incorrecta.';
    END IF;
    
    IF NOT messages_exists THEN
        RAISE EXCEPTION 'La tabla chat_messages no existe. Estructura incorrecta.';
    END IF;
    
END $$;

-- =====================================================
-- PASO 2: MOSTRAR ESTRUCTURA DETALLADA
-- =====================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'ESTRUCTURA DE chat_conversations:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_conversations' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'ESTRUCTURA DE chat_messages:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
    END LOOP;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'ESTRUCTURA DE chat_sessions:';
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'chat_sessions' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
        END LOOP;
    END IF;
    
    RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 3: LIMPIAR POLÍTICAS EXISTENTES
-- =====================================================

DO $$ 
BEGIN
    -- Eliminar políticas de chat_conversations
    DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
    DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
    DROP POLICY IF EXISTS "Agents can update conversations" ON public.chat_conversations;
    
    -- Eliminar políticas de chat_messages
    DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.chat_messages;
    DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;
    DROP POLICY IF EXISTS "Users can update message read status" ON public.chat_messages;
    
    -- Si existe chat_sessions, limpiar también
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
        DROP POLICY IF EXISTS "Users can create chat sessions" ON public.chat_sessions;
        DROP POLICY IF EXISTS "Agents can update chat sessions" ON public.chat_sessions;
    END IF;
    
    RAISE NOTICE '✅ Políticas existentes eliminadas';
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error eliminando políticas (puede ser normal): %', SQLERRM;
END $$;

-- =====================================================
-- PASO 4: HABILITAR RLS
-- =====================================================

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Si existe chat_sessions, habilitar RLS también
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado en chat_sessions';
    END IF;
    
    RAISE NOTICE '✅ RLS habilitado en chat_conversations y chat_messages';
END $$;

-- =====================================================
-- PASO 5: DETECTAR COLUMNAS DE USUARIO/AGENTE
-- =====================================================

DO $$
DECLARE
    user_column text := '';
    agent_column text := '';
BEGIN
    -- Detectar columna de usuario en chat_conversations
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_conversations' AND column_name = 'user_id') THEN
        user_column := 'user_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_conversations' AND column_name = 'buyer_id') THEN
        user_column := 'buyer_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_conversations' AND column_name = 'customer_id') THEN
        user_column := 'customer_id';
    ELSE
        RAISE EXCEPTION 'No se encontró columna de usuario en chat_conversations';
    END IF;
    
    -- Detectar columna de agente en chat_conversations
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_conversations' AND column_name = 'agent_id') THEN
        agent_column := 'agent_id';
    ELSE
        RAISE EXCEPTION 'No se encontró columna agent_id en chat_conversations';
    END IF;
    
    RAISE NOTICE '✅ Columnas detectadas:';
    RAISE NOTICE '  - Usuario: %', user_column;
    RAISE NOTICE '  - Agente: %', agent_column;
    
    -- Guardar configuración
    CREATE TEMP TABLE IF NOT EXISTS chat_config (
        user_column text,
        agent_column text
    );
    
    DELETE FROM chat_config;
    INSERT INTO chat_config VALUES (user_column, agent_column);
    
END $$;

-- =====================================================
-- PASO 6: CREAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    user_col text;
    agent_col text;
    sql_text text;
BEGIN
    -- Obtener configuración
    SELECT user_column, agent_column 
    INTO user_col, agent_col
    FROM chat_config LIMIT 1;
    
    RAISE NOTICE 'Creando políticas con: user_col=%, agent_col=%', user_col, agent_col;
    
    -- POLÍTICAS PARA chat_conversations
    
    -- Política 1: Ver propias conversaciones
    sql_text := format('
        CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
        FOR SELECT
        USING (auth.uid() = %I OR auth.uid() = %I)', user_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 2: Crear conversaciones
    sql_text := format('
        CREATE POLICY "Users can create conversations" ON public.chat_conversations
        FOR INSERT
        WITH CHECK (auth.uid() = %I)', user_col);
    EXECUTE sql_text;
    
    -- Política 3: Actualizar conversaciones (solo agentes)
    sql_text := format('
        CREATE POLICY "Agents can update conversations" ON public.chat_conversations
        FOR UPDATE
        USING (auth.uid() = %I)
        WITH CHECK (auth.uid() = %I)', agent_col, agent_col);
    EXECUTE sql_text;
    
    -- POLÍTICAS PARA chat_messages
    
    -- Política 4: Ver mensajes de propias conversaciones
    sql_text := format('
        CREATE POLICY "Users can view messages from their conversations" ON public.chat_messages
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.chat_conversations cc
                WHERE cc.id = chat_messages.conversation_id
                AND (cc.%I = auth.uid() OR cc.%I = auth.uid())
            )
        )', user_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 5: Enviar mensajes en propias conversaciones
    sql_text := format('
        CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages
        FOR INSERT
        WITH CHECK (
            auth.uid() = sender_id AND
            EXISTS (
                SELECT 1 FROM public.chat_conversations cc
                WHERE cc.id = chat_messages.conversation_id
                AND (cc.%I = auth.uid() OR cc.%I = auth.uid())
            )
        )', user_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 6: Actualizar mensajes (marcar como leído)
    sql_text := format('
        CREATE POLICY "Users can update message read status" ON public.chat_messages
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.chat_conversations cc
                WHERE cc.id = chat_messages.conversation_id
                AND (cc.%I = auth.uid() OR cc.%I = auth.uid())
            )
        )', user_col, agent_col);
    EXECUTE sql_text;
    
    RAISE NOTICE '✅ 6 políticas RLS creadas para chat_conversations y chat_messages';
    
END $$;

-- =====================================================
-- PASO 7: POLÍTICAS PARA chat_sessions (SI EXISTE)
-- =====================================================

DO $$
DECLARE
    user_col text;
    agent_col text;
    sql_text text;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        RAISE NOTICE 'La tabla chat_sessions no existe, saltando políticas';
        RETURN;
    END IF;
    
    -- Obtener configuración
    SELECT user_column, agent_column 
    INTO user_col, agent_col
    FROM chat_config LIMIT 1;
    
    -- Detectar estructura de chat_sessions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'conversation_id') THEN
        
        -- Política para ver sesiones propias
        sql_text := format('
            CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_conversations cc
                    WHERE cc.id = chat_sessions.conversation_id
                    AND (cc.%I = auth.uid() OR cc.%I = auth.uid())
                )
            )', user_col, agent_col);
        EXECUTE sql_text;
        
        -- Política para crear sesiones
        sql_text := format('
            CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.chat_conversations cc
                    WHERE cc.id = chat_sessions.conversation_id
                    AND (cc.%I = auth.uid() OR cc.%I = auth.uid())
                )
            )', user_col, agent_col);
        EXECUTE sql_text;
        
        -- Política para actualizar sesiones
        sql_text := format('
            CREATE POLICY "Agents can update chat sessions" ON public.chat_sessions
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_conversations cc
                    WHERE cc.id = chat_sessions.conversation_id
                    AND cc.%I = auth.uid()
                )
            )', agent_col);
        EXECUTE sql_text;
        
        RAISE NOTICE '✅ 3 políticas RLS creadas para chat_sessions';
        
    ELSE
        RAISE NOTICE 'chat_sessions no tiene conversation_id, saltando políticas específicas';
    END IF;
    
END $$;

-- =====================================================
-- PASO 8: VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    policy_count integer;
    conversations_rls boolean;
    messages_rls boolean;
    sessions_rls boolean := true;
BEGIN
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('chat_conversations', 'chat_messages', 'chat_sessions');
    
    -- Verificar RLS en cada tabla
    SELECT rowsecurity INTO conversations_rls
    FROM pg_tables 
    WHERE tablename = 'chat_conversations';
    
    SELECT rowsecurity INTO messages_rls
    FROM pg_tables 
    WHERE tablename = 'chat_messages';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        SELECT rowsecurity INTO sessions_rls
        FROM pg_tables 
        WHERE tablename = 'chat_sessions';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    RAISE NOTICE 'Políticas RLS creadas: %', policy_count;
    RAISE NOTICE 'RLS en chat_conversations: %', conversations_rls;
    RAISE NOTICE 'RLS en chat_messages: %', messages_rls;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        RAISE NOTICE 'RLS en chat_sessions: %', sessions_rls;
    END IF;
    
    IF policy_count >= 6 AND conversations_rls AND messages_rls AND sessions_rls THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ¡CONFIGURACIÓN EXITOSA!';
        RAISE NOTICE '✅ El sistema de chat está configurado correctamente';
        RAISE NOTICE '✅ Estructura: chat_conversations + chat_messages + conversation_id';
        RAISE NOTICE '🚀 Puedes proceder a probar el frontend';
        RAISE NOTICE '';
        RAISE NOTICE 'IMPORTANTE: Actualiza el frontend para usar "conversation_id" en lugar de "session_id"';
    ELSE
        RAISE WARNING 'Configuración incompleta. Políticas: %, RLS: % % %', 
                     policy_count, conversations_rls, messages_rls, sessions_rls;
    END IF;
    
END $$;

-- Limpiar configuración temporal
DROP TABLE IF EXISTS chat_config;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'SCRIPT COMPLETADO';
    RAISE NOTICE '==============================================';
END $$;
