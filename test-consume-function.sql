-- Prueba manual de la función con tu ID real
SELECT public.consume_publication('e1b5c3d3-4571-4c37-9b73-6fb484f90084'::uuid) as result;

-- Ver el estado de tu agente después de la prueba
SELECT 
    id,
    credits,
    free_publications_used,
    is_new_agent,
    is_verified,
    total_credits_used
FROM public.agents 
WHERE id = 'e1b5c3d3-4571-4c37-9b73-6fb484f90084'::uuid;
