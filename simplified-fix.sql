-- =====================================================
-- SCRIPT SIMPLIFICADO - SOLO LA FUNCIÓN QUE NECESITAMOS
-- =====================================================

-- 1. Eliminar funciones complejas
DROP FUNCTION IF EXISTS public.use_free_publication(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.activate_property_with_credit(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.can_use_free_publication(UUID) CASCADE;

-- 2. Crear SOLO la función que consume créditos (la que estaba fallando originalmente)
CREATE OR REPLACE FUNCTION public.consume_publication(agent_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    agent_credits INTEGER;
    agent_free_pubs INTEGER;
    agent_is_new BOOLEAN;
    agent_verified BOOLEAN;
BEGIN
    -- Obtener datos del agente
    SELECT 
        COALESCE(credits, 0),
        COALESCE(free_publications_used, 0),
        COALESCE(is_new_agent, TRUE),
        COALESCE(is_verified, TRUE)
    INTO 
        agent_credits,
        agent_free_pubs,
        agent_is_new,
        agent_verified
    FROM public.agents 
    WHERE id = agent_uuid;
    
    -- Si no existe el agente, devolver false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Prioridad 1: Usar publicación gratis si es posible
    IF agent_is_new AND agent_verified AND agent_free_pubs < 2 THEN
        UPDATE public.agents
        SET 
            free_publications_used = free_publications_used + 1,
            is_new_agent = CASE 
                WHEN free_publications_used + 1 >= 2 THEN FALSE 
                ELSE is_new_agent 
            END,
            updated_at = NOW()
        WHERE id = agent_uuid;
        
        RETURN TRUE;
    END IF;
    
    -- Prioridad 2: Usar créditos pagados
    IF agent_credits >= 1 THEN
        UPDATE public.agents
        SET 
            credits = credits - 1,
            total_credits_used = COALESCE(total_credits_used, 0) + 1,
            publicaciones_disponibles = COALESCE(publicaciones_disponibles, 0) - 1,
            updated_at = NOW()
        WHERE id = agent_uuid;
        
        RETURN TRUE;
    END IF;
    
    -- No tiene créditos ni publicaciones gratis
    RETURN FALSE;
END;
$$;

-- 3. Dar permisos
GRANT EXECUTE ON FUNCTION public.consume_publication(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_publication(UUID) TO anon;

-- 4. Verificar
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_name = 'consume_publication';
