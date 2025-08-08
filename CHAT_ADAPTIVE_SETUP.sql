-- =====================================================
-- SCRIPT ADAPTATIVO PARA POLÍTICAS RLS DEL CHAT
-- =====================================================
-- Este script se adapta a diferentes estructuras de tablas

-- =====================================================
-- PASO 1: DETECTAR ESTRUCTURA DE TABLAS
-- =====================================================

DO $$
DECLARE
    chat_sessions_exists boolean := false;
    chat_messages_exists boolean := false;
    session_id_column text := '';
    user_column text := '';
    agent_column text := '';
BEGIN
    -- Verificar si existen las tablas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'chat_sessions' AND table_schema = 'public'
    ) INTO chat_sessions_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'chat_messages' AND table_schema = 'public'
    ) INTO chat_messages_exists;
    
    IF NOT chat_sessions_exists THEN
        RAISE EXCEPTION 'La tabla chat_sessions no existe. Por favor, ejecuta primero SUPABASE_DATABASE_SETUP.sql';
    END IF;
    
    IF NOT chat_messages_exists THEN
        RAISE EXCEPTION 'La tabla chat_messages no existe. Por favor, ejecuta primero SUPABASE_DATABASE_SETUP.sql';
    END IF;
    
    -- Detectar nombre de columna para sesión en chat_messages
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'session_id') THEN
        session_id_column := 'session_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'chat_session_id') THEN
        session_id_column := 'chat_session_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'chat_id') THEN
        session_id_column := 'chat_id';
    ELSE
        RAISE EXCEPTION 'No se encontró columna de sesión en chat_messages. Columnas posibles: session_id, chat_session_id, chat_id';
    END IF;
    
    -- Detectar nombre de columna para usuario en chat_sessions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'user_id') THEN
        user_column := 'user_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'buyer_id') THEN
        user_column := 'buyer_id';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'customer_id') THEN
        user_column := 'customer_id';
    ELSE
        RAISE EXCEPTION 'No se encontró columna de usuario en chat_sessions. Columnas posibles: user_id, buyer_id, customer_id';
    END IF;
    
    -- Detectar nombre de columna para agente en chat_sessions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'agent_id') THEN
        agent_column := 'agent_id';
    ELSE
        RAISE EXCEPTION 'No se encontró columna agent_id en chat_sessions';
    END IF;
    
    RAISE NOTICE '✅ Detección de estructura exitosa:';
    RAISE NOTICE 'Columna de sesión en chat_messages: %', session_id_column;
    RAISE NOTICE 'Columna de usuario en chat_sessions: %', user_column;
    RAISE NOTICE 'Columna de agente en chat_sessions: %', agent_column;
    
    -- Guardar en tabla temporal para usar en el resto del script
    CREATE TEMP TABLE IF NOT EXISTS chat_config (
        session_column text,
        user_column text,
        agent_column text
    );
    
    DELETE FROM chat_config;
    INSERT INTO chat_config VALUES (session_id_column, user_column, agent_column);
    
END $$;

-- =====================================================
-- PASO 2: MOSTRAR ESTRUCTURA DETECTADA
-- =====================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'ESTRUCTURA DETECTADA DE chat_sessions:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'ESTRUCTURA DETECTADA DE chat_messages:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
    END LOOP;
    RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 3: LIMPIAR POLÍTICAS EXISTENTES
-- =====================================================

DO $$ 
BEGIN
    -- Eliminar todas las políticas existentes de chat
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Buyers can create chat sessions" ON public.chat_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Agents can update their chat sessions" ON public.chat_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Users can send messages in their sessions" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update message read status" ON public.chat_messages';
    
    RAISE NOTICE 'Políticas existentes eliminadas';
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error eliminando políticas (puede ser normal): %', SQLERRM;
END $$;

-- =====================================================
-- PASO 4: HABILITAR RLS
-- =====================================================

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 5: CREAR POLÍTICAS DINÁMICAMENTE
-- =====================================================

DO $$
DECLARE
    session_col text;
    user_col text;
    agent_col text;
    sql_text text;
BEGIN
    -- Obtener configuración detectada
    SELECT session_column, user_column, agent_column 
    INTO session_col, user_col, agent_col
    FROM chat_config LIMIT 1;
    
    RAISE NOTICE 'Creando políticas con columnas: session=%, user=%, agent=%', session_col, user_col, agent_col;
    
    -- Política 1: Ver propias sesiones de chat
    sql_text := format('
        CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
        FOR SELECT
        USING (auth.uid() = %I OR auth.uid() = %I)', user_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 2: Crear sesiones de chat
    sql_text := format('
        CREATE POLICY "Buyers can create chat sessions" ON public.chat_sessions
        FOR INSERT
        WITH CHECK (auth.uid() = %I)', user_col);
    EXECUTE sql_text;
    
    -- Política 3: Actualizar sesiones (solo agentes)
    sql_text := format('
        CREATE POLICY "Agents can update their chat sessions" ON public.chat_sessions
        FOR UPDATE
        USING (auth.uid() = %I)
        WITH CHECK (auth.uid() = %I)', agent_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 4: Ver mensajes de propias sesiones
    sql_text := format('
        CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.chat_sessions cs
                WHERE cs.id = chat_messages.%I
                AND (cs.%I = auth.uid() OR cs.%I = auth.uid())
            )
        )', session_col, user_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 5: Enviar mensajes en propias sesiones
    sql_text := format('
        CREATE POLICY "Users can send messages in their sessions" ON public.chat_messages
        FOR INSERT
        WITH CHECK (
            auth.uid() = sender_id AND
            EXISTS (
                SELECT 1 FROM public.chat_sessions cs
                WHERE cs.id = chat_messages.%I
                AND (cs.%I = auth.uid() OR cs.%I = auth.uid())
            )
        )', session_col, user_col, agent_col);
    EXECUTE sql_text;
    
    -- Política 6: Actualizar mensajes (marcar como leído)
    sql_text := format('
        CREATE POLICY "Users can update message read status" ON public.chat_messages
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.chat_sessions cs
                WHERE cs.id = chat_messages.%I
                AND (cs.%I = auth.uid() OR cs.%I = auth.uid())
            )
        )', session_col, user_col, agent_col);
    EXECUTE sql_text;
    
    RAISE NOTICE '✅ 6 políticas RLS creadas exitosamente';
    
END $$;

-- =====================================================
-- PASO 6: VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    policy_count integer;
    rls_enabled boolean;
BEGIN
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('chat_sessions', 'chat_messages');
    
    -- Verificar RLS
    SELECT bool_and(rowsecurity) INTO rls_enabled
    FROM pg_tables 
    WHERE tablename IN ('chat_sessions', 'chat_messages');
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    RAISE NOTICE 'Políticas RLS creadas: %', policy_count;
    RAISE NOTICE 'RLS habilitado: %', rls_enabled;
    
    IF policy_count >= 6 AND rls_enabled THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ¡CONFIGURACIÓN EXITOSA!';
        RAISE NOTICE '✅ El sistema de chat está configurado correctamente';
        RAISE NOTICE '🚀 Puedes proceder a probar el frontend';
    ELSE
        RAISE WARNING 'Configuración incompleta. Políticas: %, RLS: %', policy_count, rls_enabled;
    END IF;
    
END $$;

-- Limpiar tabla temporal
DROP TABLE IF EXISTS chat_config;
