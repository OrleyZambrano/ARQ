-- =====================================================
-- SCRIPT DE DIAGNÓSTICO PARA TABLAS DE CHAT
-- =====================================================
-- Este script verifica la estructura real de las tablas en tu base de datos

-- =====================================================
-- VERIFICAR QUE LAS TABLAS EXISTEN
-- =====================================================

-- Listar todas las tablas que contienen "chat" en el nombre
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%chat%'
AND table_schema = 'public';

-- =====================================================
-- ESTRUCTURA DE CHAT_SESSIONS
-- =====================================================

SELECT 
    'CHAT_SESSIONS' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- ESTRUCTURA DE CHAT_MESSAGES
-- =====================================================

SELECT 
    'CHAT_MESSAGES' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'chat_messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICAR FOREIGN KEYS
-- =====================================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('chat_sessions', 'chat_messages');

-- =====================================================
-- VERIFICAR ÍNDICES Y CONSTRAINTS
-- =====================================================

SELECT 
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name
FROM pg_class t,
     pg_class i,
     pg_index ix,
     pg_attribute a
WHERE t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname IN ('chat_sessions', 'chat_messages')
ORDER BY t.relname, i.relname;

-- =====================================================
-- VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('chat_sessions', 'chat_messages');

-- =====================================================
-- MENSAJE INFORMATIVO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DIAGNÓSTICO COMPLETADO';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Revisa los resultados arriba para ver:';
    RAISE NOTICE '1. Qué tablas de chat existen';
    RAISE NOTICE '2. La estructura exacta de cada tabla';
    RAISE NOTICE '3. Las relaciones entre tablas';
    RAISE NOTICE '4. Los índices y constraints';
    RAISE NOTICE '5. Las políticas RLS existentes';
    RAISE NOTICE '';
    RAISE NOTICE 'Con esta información podremos crear el script correcto.';
END $$;
