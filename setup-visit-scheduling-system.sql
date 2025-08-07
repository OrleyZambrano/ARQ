-- Tabla para almacenar las solicitudes de visitas a propiedades
CREATE TABLE IF NOT EXISTS property_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Información del visitante
    visitor_name VARCHAR(255) NOT NULL,
    visitor_email VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    
    -- Fecha y hora solicitada
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    
    -- Fecha y hora confirmada (cuando el agente confirma)
    confirmed_date DATE,
    confirmed_time TIME,
    
    -- Mensaje opcional del visitante
    message TEXT,
    
    -- Estado de la visita
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
    
    -- Notas del agente
    agent_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_property_visits_property_id ON property_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_property_visits_agent_id ON property_visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_visits_visitor_email ON property_visits(visitor_email);
CREATE INDEX IF NOT EXISTS idx_property_visits_status ON property_visits(status);
CREATE INDEX IF NOT EXISTS idx_property_visits_preferred_date ON property_visits(preferred_date);
CREATE INDEX IF NOT EXISTS idx_property_visits_created_at ON property_visits(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_property_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_property_visits_updated_at ON property_visits;
CREATE TRIGGER trigger_update_property_visits_updated_at
    BEFORE UPDATE ON property_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_property_visits_updated_at();

-- RLS (Row Level Security) para property_visits
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Agents can view their own visits" ON property_visits;
DROP POLICY IF EXISTS "Agents can update their own visits" ON property_visits;
DROP POLICY IF EXISTS "Authenticated users can create visits" ON property_visits;
DROP POLICY IF EXISTS "Users can view their own visits by email" ON property_visits;
DROP POLICY IF EXISTS "Users can cancel their own visits" ON property_visits;

-- Política para que los agentes solo vean sus propias visitas
CREATE POLICY "Agents can view their own visits" ON property_visits
    FOR SELECT
    USING (agent_id = auth.uid());

-- Política para que los agentes puedan actualizar sus propias visitas
CREATE POLICY "Agents can update their own visits" ON property_visits
    FOR UPDATE
    USING (agent_id = auth.uid());

-- Política para que cualquier usuario autenticado pueda crear visitas
CREATE POLICY "Authenticated users can create visits" ON property_visits
    FOR INSERT
    WITH CHECK (true);

-- Política para que los usuarios puedan ver sus propias visitas por email
CREATE POLICY "Users can view their own visits by email" ON property_visits
    FOR SELECT
    USING (visitor_email = auth.email());

-- Política para que los usuarios puedan cancelar sus propias visitas
CREATE POLICY "Users can cancel their own visits" ON property_visits
    FOR UPDATE
    USING (visitor_email = auth.email() AND status IN ('pending', 'confirmed'));

-- Función para obtener estadísticas de visitas de un agente
CREATE OR REPLACE FUNCTION get_agent_visits_stats(agent_uuid UUID)
RETURNS TABLE (
    total_visits BIGINT,
    pending_visits BIGINT,
    confirmed_visits BIGINT,
    completed_visits BIGINT,
    this_month_visits BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_visits,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_visits,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_visits,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_visits,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month_visits
    FROM property_visits 
    WHERE agent_id = agent_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener próximas visitas confirmadas de un agente
CREATE OR REPLACE FUNCTION get_agent_upcoming_visits(agent_uuid UUID, days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    visit_id UUID,
    property_title TEXT,
    property_address TEXT,
    visitor_name TEXT,
    visitor_email TEXT,
    visitor_phone TEXT,
    confirmed_date DATE,
    confirmed_time TIME,
    agent_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.id as visit_id,
        p.title::TEXT as property_title,
        p.address::TEXT as property_address,
        pv.visitor_name::TEXT,
        pv.visitor_email::TEXT,
        pv.visitor_phone::TEXT,
        pv.confirmed_date,
        pv.confirmed_time,
        pv.agent_notes::TEXT
    FROM property_visits pv
    JOIN properties p ON pv.property_id = p.id
    WHERE pv.agent_id = agent_uuid
        AND pv.status = 'confirmed'
        AND pv.confirmed_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + (days_ahead || ' days')::INTERVAL)
    ORDER BY pv.confirmed_date, pv.confirmed_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar al agente cuando se agenda una nueva visita
CREATE OR REPLACE FUNCTION notify_agent_new_visit()
RETURNS TRIGGER AS $$
BEGIN
    -- Función simplificada que solo registra en logs de PostgreSQL
    -- En el futuro se puede integrar con un servicio de notificaciones
    RAISE NOTICE 'Nueva visita solicitada: ID=%, Propiedad=%, Visitante=%, Fecha=% %', 
        NEW.id, 
        NEW.property_id, 
        NEW.visitor_name, 
        NEW.preferred_date,
        NEW.preferred_time;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar al agente sobre nuevas visitas
DROP TRIGGER IF EXISTS trigger_notify_agent_new_visit ON property_visits;
CREATE TRIGGER trigger_notify_agent_new_visit
    AFTER INSERT ON property_visits
    FOR EACH ROW
    EXECUTE FUNCTION notify_agent_new_visit();

-- Comentarios para documentación
COMMENT ON TABLE property_visits IS 'Almacena las solicitudes de visitas a propiedades';
COMMENT ON COLUMN property_visits.status IS 'Estado de la visita: pending, confirmed, rejected, completed, cancelled';
COMMENT ON COLUMN property_visits.preferred_date IS 'Fecha preferida por el visitante';
COMMENT ON COLUMN property_visits.preferred_time IS 'Hora preferida por el visitante';
COMMENT ON COLUMN property_visits.confirmed_date IS 'Fecha confirmada por el agente';
COMMENT ON COLUMN property_visits.confirmed_time IS 'Hora confirmada por el agente';
COMMENT ON COLUMN property_visits.agent_notes IS 'Notas privadas del agente sobre la visita';
