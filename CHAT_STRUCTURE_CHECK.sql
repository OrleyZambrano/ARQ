-- =====================================================
-- DIAGNÓSTICO SIMPLE DE ESTRUCTURA DE CHAT_MESSAGES
-- =====================================================

-- Ver todas las columnas de chat_messages
SELECT 
    'chat_messages' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'chat_messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver todas las columnas de chat_sessions
SELECT 
    'chat_sessions' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('chat_sessions', 'chat_messages');

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Por favor revisa los resultados arriba';
    RAISE NOTICE '==============================================';
END $$;
