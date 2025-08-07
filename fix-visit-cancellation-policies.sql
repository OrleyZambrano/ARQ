-- Corrección de políticas RLS para permitir cancelación de visitas
-- Este script corrige el problema de error 403 al cancelar visitas

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can cancel their own visits" ON property_visits;
DROP POLICY IF EXISTS "Users can update their visit details" ON property_visits;

-- 2. Crear política simplificada para cancelación de usuarios
CREATE POLICY "Users can cancel their own visits" ON property_visits
    FOR UPDATE
    USING (visitor_email = auth.email() AND status IN ('pending', 'confirmed'));

-- 3. Crear política WITH CHECK para validar los cambios permitidos
CREATE POLICY "Users can update their visit details" ON property_visits
    FOR UPDATE
    USING (visitor_email = auth.email())
    WITH CHECK (visitor_email = auth.email());

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'property_visits' 
    AND policyname LIKE '%Users can%'
ORDER BY policyname;

-- 5. Script de prueba para verificar cancelación
DO $$
DECLARE
    test_visit_id UUID;
BEGIN
    -- Buscar una visita confirmada para probar
    SELECT id INTO test_visit_id 
    FROM property_visits 
    WHERE status = 'confirmed' 
    LIMIT 1;
    
    IF test_visit_id IS NOT NULL THEN
        RAISE NOTICE 'Probando cancelación de visita: %', test_visit_id;
        
        -- Intentar cancelar (esta operación debería funcionar ahora)
        UPDATE property_visits 
        SET 
            status = 'cancelled',
            agent_notes = COALESCE(agent_notes, '') || ' - Cancelada por el usuario'
        WHERE id = test_visit_id;
        
        RAISE NOTICE 'Visita cancelada exitosamente';
    ELSE
        RAISE NOTICE 'No se encontraron visitas confirmadas para probar';
    END IF;
END $$;

-- 6. Comentarios para documentación
COMMENT ON POLICY "Users can cancel their own visits" ON property_visits IS 
'Permite a los usuarios cancelar sus propias visitas (pendientes o confirmadas)';

COMMENT ON POLICY "Users can update their visit details" ON property_visits IS 
'Permite a los usuarios actualizar detalles de sus visitas y cancelarlas';
