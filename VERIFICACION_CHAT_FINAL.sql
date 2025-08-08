-- =====================================================
-- VERIFICACIÓN FINAL DE ESTRUCTURA PARA CHAT
-- =====================================================

-- Verificar que las tablas existen
SELECT 'chat_conversations' as tabla, COUNT(*) as registros FROM public.chat_conversations
UNION ALL
SELECT 'chat_messages' as tabla, COUNT(*) as registros FROM public.chat_messages
UNION ALL
SELECT 'user_profiles' as tabla, COUNT(*) as registros FROM public.user_profiles
UNION ALL
SELECT 'properties' as tabla, COUNT(*) as registros FROM public.properties;

-- Verificar estructura de chat_conversations
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'ESTRUCTURA DE chat_conversations:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_conversations' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'ESTRUCTURA DE chat_messages:';
    FOR rec IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', rec.column_name, rec.data_type;
    END LOOP;
END $$;

-- Verificar políticas RLS
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('chat_conversations', 'chat_messages')
ORDER BY tablename, policyname;
