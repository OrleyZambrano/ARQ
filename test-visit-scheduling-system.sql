-- Script para probar el sistema de agendamiento de visitas
-- Ejecutar después de crear la tabla property_visits

-- 1. Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'property_visits' 
ORDER BY ordinal_position;

-- 2. Verificar que los índices se crearon
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'property_visits';

-- 3. Verificar que las políticas RLS se crearon
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'property_visits';

-- 4. Insertar datos de prueba (asegúrate de que existan propiedades y agentes)
-- Obtener un agente y una propiedad existente para la prueba
DO $$
DECLARE
    test_property_id UUID;
    test_agent_id UUID;
    test_visit_id UUID;
BEGIN
    -- Obtener una propiedad existente
    SELECT id INTO test_property_id FROM properties LIMIT 1;
    
    -- Obtener un agente existente
    SELECT id INTO test_agent_id FROM agents LIMIT 1;
    
    -- Si existen datos, crear una visita de prueba
    IF test_property_id IS NOT NULL AND test_agent_id IS NOT NULL THEN
        INSERT INTO property_visits (
            property_id,
            agent_id,
            visitor_name,
            visitor_email,
            visitor_phone,
            preferred_date,
            preferred_time,
            message,
            status
        ) VALUES (
            test_property_id,
            test_agent_id,
            'Juan Pérez',
            'juan.perez@email.com',
            '+34 666 777 888',
            CURRENT_DATE + INTERVAL '3 days',
            '10:00:00',
            'Me interesa mucho esta propiedad, ¿podríamos agendar una visita?',
            'pending'
        ) RETURNING id INTO test_visit_id;
        
        RAISE NOTICE 'Visita de prueba creada con ID: %', test_visit_id;
        
        -- Simular confirmación de la visita
        UPDATE property_visits 
        SET 
            status = 'confirmed',
            confirmed_date = preferred_date,
            confirmed_time = preferred_time,
            agent_notes = 'Visita confirmada. Reunirnos en la entrada principal.'
        WHERE id = test_visit_id;
        
        RAISE NOTICE 'Visita confirmada exitosamente';
        
    ELSE
        RAISE NOTICE 'No se encontraron propiedades o agentes para crear la visita de prueba';
    END IF;
END $$;

-- 5. Probar las funciones
DO $$
DECLARE
    test_agent_id UUID;
    stats_record RECORD;
BEGIN
    -- Obtener un agente para probar las estadísticas
    SELECT id INTO test_agent_id FROM agents LIMIT 1;
    
    IF test_agent_id IS NOT NULL THEN
        -- Probar función de estadísticas
        SELECT * INTO stats_record FROM get_agent_visits_stats(test_agent_id);
        
        RAISE NOTICE 'Estadísticas del agente %:', test_agent_id;
        RAISE NOTICE 'Total visitas: %', stats_record.total_visits;
        RAISE NOTICE 'Visitas pendientes: %', stats_record.pending_visits;
        RAISE NOTICE 'Visitas confirmadas: %', stats_record.confirmed_visits;
        RAISE NOTICE 'Visitas completadas: %', stats_record.completed_visits;
        RAISE NOTICE 'Visitas este mes: %', stats_record.this_month_visits;
        
        -- Probar función de próximas visitas
        RAISE NOTICE 'Próximas visitas confirmadas:';
        FOR stats_record IN SELECT * FROM get_agent_upcoming_visits(test_agent_id, 30) LOOP
            RAISE NOTICE 'Visita: % - % - % a las %', 
                stats_record.property_title,
                stats_record.visitor_name,
                stats_record.confirmed_date,
                stats_record.confirmed_time;
        END LOOP;
    END IF;
END $$;

-- 6. Verificar que los triggers funcionan
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'property_visits';

-- 7. Consulta para ver todas las visitas con información de propiedades
SELECT 
    pv.id,
    pv.visitor_name,
    pv.visitor_email,
    pv.status,
    pv.preferred_date,
    pv.preferred_time,
    pv.confirmed_date,
    pv.confirmed_time,
    p.title as property_title,
    p.address as property_address,
    p.price,
    COALESCE(a.full_name, a.email, a.id::TEXT) as agent_name,
    a.email as agent_email,
    pv.created_at,
    pv.updated_at
FROM property_visits pv
JOIN properties p ON pv.property_id = p.id
LEFT JOIN agents a ON pv.agent_id = a.id
ORDER BY pv.created_at DESC;

-- 8. Verificar que las restricciones funcionan
-- Esta consulta debería fallar si las restricciones están funcionando correctamente
-- (comentada para no causar error)
/*
INSERT INTO property_visits (
    property_id,
    agent_id,
    visitor_name,
    visitor_email,
    status
) VALUES (
    gen_random_uuid(), -- ID de propiedad que no existe
    gen_random_uuid(), -- ID de agente que no existe
    'Test User',
    'test@test.com',
    'invalid_status' -- Estado inválido
);
*/

-- 9. Limpiar datos de prueba (opcional)
-- DELETE FROM property_visits WHERE visitor_email = 'juan.perez@email.com';

-- 10. Mensaje final
DO $$
BEGIN
    RAISE NOTICE 'Pruebas del sistema de agendamiento de visitas completadas';
END $$;
