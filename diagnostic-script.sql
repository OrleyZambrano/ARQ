-- =====================================================
-- SCRIPT DE DIAGNÓSTICO - VERIFICAR ESTADO DE LA BD
-- =====================================================

-- 1. Verificar si las funciones existen
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_name IN (
    'use_free_publication',
    'activate_property_with_credit',
    'consume_publication',
    'can_use_free_publication'
)
ORDER BY routine_name;

-- 2. Verificar estructura de tabla agents
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agents' 
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla properties
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('status', 'is_free_publication', 'published_at', 'expires_at')
ORDER BY ordinal_position;

-- 4. Verificar datos del agente actual (reemplazar con tu user ID)
-- SELECT 
--     id,
--     credits,
--     free_publications_used,
--     is_new_agent,
--     is_verified,
--     publicaciones_disponibles
-- FROM agents 
-- WHERE id = 'TU_USER_ID_AQUI';

-- 5. Verificar esquema actual
SELECT current_schema();

-- 6. Verificar permisos en funciones
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN (
    'use_free_publication',
    'activate_property_with_credit', 
    'consume_publication',
    'can_use_free_publication'
);
