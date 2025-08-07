-- =====================================================
-- SCRIPT DE PRUEBA PARA DEBUGGEAR FUNCIONES
-- =====================================================

-- 1. Probar función can_use_free_publication con tu ID
SELECT public.can_use_free_publication('e1b5c3d3-4571-4c37-9b73-6fb484f90084'::uuid) as can_use_free;

-- 2. Ver detalles de tu agente
SELECT 
    id,
    credits,
    free_publications_used,
    is_new_agent,
    is_verified,
    total_credits_used
FROM public.agents 
WHERE id = 'e1b5c3d3-4571-4c37-9b73-6fb484f90084'::uuid;

-- 3. Crear una propiedad de prueba para testear
INSERT INTO public.properties (
    id,
    agent_id,
    title,
    description,
    price,
    property_type,
    transaction_type,
    status,
    bedrooms,
    bathrooms,
    area,
    location,
    address,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'e1b5c3d3-4571-4c37-9b73-6fb484f90084'::uuid,
    'Propiedad de Prueba',
    'Esta es una propiedad creada para pruebas',
    100000,
    'house',
    'sale',
    'draft',
    3,
    2,
    150.5,
    'Quito',
    'Calle de Prueba 123',
    NOW(),
    NOW()
) RETURNING id;

-- 4. Nota: Toma el ID que devuelve la consulta anterior y úsalo aquí
-- Reemplaza 'PROPERTY_ID_AQUI' con el ID real
-- SELECT public.use_free_publication(
--     'e1b5c3d3-4571-4c37-9b73-6fb484f90084'::uuid,
--     'PROPERTY_ID_AQUI'::uuid
-- ) as free_publication_result;

-- 5. Verificar errores en logs de Supabase
-- Ve a tu proyecto Supabase > Logs > Database para ver errores detallados

-- 6. Probar si las funciones son visibles desde la API
SELECT 
    p.proname as function_name,
    p.proargnames as argument_names,
    p.proargtypes::regtype[] as argument_types
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN ('use_free_publication', 'activate_property_with_credit');
