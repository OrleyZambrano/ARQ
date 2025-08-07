-- =====================================================
-- SCRIPT PARA MANEJAR DEPENDENCIAS Y RECREAR FUNCIONES
-- =====================================================

-- 1. Asegurar que trabajamos en el esquema public
SET search_path TO public;

-- 2. Eliminar la vista que depende de las funciones
DROP VIEW IF EXISTS agent_dashboard_view CASCADE;

-- 3. Eliminar funciones existentes con CASCADE
DROP FUNCTION IF EXISTS public.use_free_publication(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.activate_property_with_credit(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.consume_publication(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.can_use_free_publication(UUID) CASCADE;

-- 4. Crear función para verificar publicaciones gratis
CREATE OR REPLACE FUNCTION public.can_use_free_publication(agent_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    agent_record RECORD;
BEGIN
    SELECT 
        COALESCE(free_publications_used, 0) as free_publications_used,
        COALESCE(is_new_agent, TRUE) as is_new_agent,
        COALESCE(is_verified, TRUE) as is_verified
    INTO agent_record
    FROM public.agents
    WHERE id = agent_uuid;

    -- Si no existe el agente, devolver false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Puede usar gratis si: es nuevo, está verificado y no ha usado las 2 gratis
    RETURN agent_record.is_new_agent
           AND agent_record.is_verified
           AND agent_record.free_publications_used < 2;
END;
$$;

-- 5. Crear función para usar publicación gratis
CREATE OR REPLACE FUNCTION public.use_free_publication(agent_uuid UUID, property_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    can_use BOOLEAN;
    affected_rows INTEGER;
BEGIN
    -- Verificar si puede usar gratis
    SELECT public.can_use_free_publication(agent_uuid) INTO can_use;
    
    IF NOT can_use THEN
        RETURN FALSE;
    END IF;

    -- Marcar propiedad como publicación gratis y activarla
    UPDATE public.properties
    SET 
        is_free_publication = TRUE,
        status = 'active',
        published_at = NOW(),
        expires_at = NOW() + INTERVAL '60 days',
        updated_at = NOW()
    WHERE id = property_uuid AND agent_id = agent_uuid;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows = 0 THEN
        RETURN FALSE;
    END IF;

    -- Incrementar contador de publicaciones gratis usadas
    UPDATE public.agents
    SET 
        free_publications_used = COALESCE(free_publications_used, 0) + 1,
        is_new_agent = CASE 
            WHEN COALESCE(free_publications_used, 0) + 1 >= 2 THEN FALSE 
            ELSE is_new_agent 
        END,
        updated_at = NOW()
    WHERE id = agent_uuid;

    RETURN TRUE;
END;
$$;

-- 6. Crear función para consumir crédito
CREATE OR REPLACE FUNCTION public.consume_publication(agent_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    agent_credits INTEGER;
    affected_rows INTEGER;
BEGIN
    -- Verificar créditos disponibles
    SELECT COALESCE(credits, 0) INTO agent_credits 
    FROM public.agents 
    WHERE id = agent_uuid;
    
    IF agent_credits < 1 THEN
        RETURN FALSE;
    END IF;

    -- Descontar crédito
    UPDATE public.agents
    SET 
        credits = credits - 1,
        total_credits_used = COALESCE(total_credits_used, 0) + 1,
        publicaciones_disponibles = COALESCE(publicaciones_disponibles, 0) - 1,
        updated_at = NOW()
    WHERE id = agent_uuid AND credits > 0;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows > 0;
END;
$$;

-- 7. Crear función para activar propiedad con crédito
CREATE OR REPLACE FUNCTION public.activate_property_with_credit(agent_uuid UUID, property_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    credit_consumed BOOLEAN;
    affected_rows INTEGER;
BEGIN
    -- Intentar consumir crédito
    SELECT public.consume_publication(agent_uuid) INTO credit_consumed;
    
    IF NOT credit_consumed THEN
        RETURN FALSE;
    END IF;

    -- Activar propiedad
    UPDATE public.properties
    SET 
        status = 'active',
        published_at = NOW(),
        expires_at = NOW() + INTERVAL '90 days',
        updated_at = NOW()
    WHERE id = property_uuid AND agent_id = agent_uuid;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows > 0;
END;
$$;

-- 8. Recrear la vista agent_dashboard_view si era necesaria
CREATE OR REPLACE VIEW agent_dashboard_view AS
SELECT 
    a.id,
    a.credits,
    a.free_publications_used,
    a.is_new_agent,
    a.is_verified,
    a.total_credits_used,
    a.publicaciones_disponibles,
    public.can_use_free_publication(a.id) as can_use_free,
    COUNT(p.id) FILTER (WHERE p.status = 'active') as active_properties_count
FROM public.agents a
LEFT JOIN public.properties p ON p.agent_id = a.id
GROUP BY a.id, a.credits, a.free_publications_used, a.is_new_agent, 
         a.is_verified, a.total_credits_used, a.publicaciones_disponibles;

-- 9. Dar permisos a las funciones para usuarios autenticados
GRANT EXECUTE ON FUNCTION public.can_use_free_publication(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_free_publication(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_publication(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_property_with_credit(UUID, UUID) TO authenticated;

-- 10. Dar permisos a anon si es necesario
GRANT EXECUTE ON FUNCTION public.can_use_free_publication(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.use_free_publication(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.consume_publication(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.activate_property_with_credit(UUID, UUID) TO anon;

-- 11. Dar permisos a la vista
GRANT SELECT ON agent_dashboard_view TO authenticated;
GRANT SELECT ON agent_dashboard_view TO anon;

-- 12. Verificar que las funciones se crearon
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
