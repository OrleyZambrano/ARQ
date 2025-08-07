-- =====================================================
-- ACTUALIZACIÓN DE BASE DE DATOS PARA MÉTRICAS MEJORADAS
-- =====================================================

-- 1. AGREGAR COLUMNAS A tracking_events PARA MÉTRICAS INTELIGENTES
ALTER TABLE tracking_events 
ADD COLUMN IF NOT EXISTS is_unique_view BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_agent_view BOOLEAN DEFAULT FALSE;

-- 2. CREAR TABLA PARA HISTORIAL DE ESTADOS DE PROPIEDADES
CREATE TABLE IF NOT EXISTS property_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT,
    notes TEXT,
    updated_by UUID REFERENCES auth.users(id) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGREGAR CAMPOS DE ESTADO A properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE;

-- 4. ACTUALIZAR FUNCIÓN DE ANALYTICS PARA EXCLUIR VISTAS DE AGENTES
CREATE OR REPLACE FUNCTION update_property_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear registro de analytics si no existe
  INSERT INTO property_analytics (property_id)
  VALUES (NEW.property_id)
  ON CONFLICT (property_id) DO NOTHING;

  -- Solo actualizar si NO es vista del agente propietario
  IF NOT NEW.is_agent_view THEN
    -- Actualizar contadores según el tipo de evento
    UPDATE property_analytics SET
      total_views = total_views + CASE WHEN NEW.event_type = 'view' THEN 1 ELSE 0 END,
      unique_views = unique_views + CASE WHEN NEW.event_type = 'view' AND NEW.is_unique_view = TRUE THEN 1 ELSE 0 END,
      contacts_initiated = contacts_initiated + CASE WHEN NEW.event_type = 'contact' THEN 1 ELSE 0 END,
      chats_started = chats_started + CASE WHEN NEW.event_type = 'chat' THEN 1 ELSE 0 END,
      visits_scheduled = visits_scheduled + CASE WHEN NEW.event_type = 'visit_request' THEN 1 ELSE 0 END,
      times_favorited = times_favorited + CASE 
        WHEN NEW.event_type = 'favorite' THEN 1 
        WHEN NEW.event_type = 'unfavorite' THEN -1 
        ELSE 0 
      END,
      traffic_search = traffic_search + CASE WHEN NEW.source = 'search' AND NEW.event_type = 'view' THEN 1 ELSE 0 END,
      traffic_map = traffic_map + CASE WHEN NEW.source = 'map' AND NEW.event_type = 'view' THEN 1 ELSE 0 END,
      traffic_direct = traffic_direct + CASE WHEN NEW.source = 'direct' AND NEW.event_type = 'view' THEN 1 ELSE 0 END,
      traffic_social = traffic_social + CASE WHEN NEW.source = 'social' AND NEW.event_type = 'view' THEN 1 ELSE 0 END,
      last_updated = NOW()
    WHERE property_id = NEW.property_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CREAR FUNCIÓN PARA DETECTAR SI ES VISTA DEL AGENTE
CREATE OR REPLACE FUNCTION detect_agent_view(property_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_agent_owner BOOLEAN := FALSE;
BEGIN
  -- Verificar si el usuario es el agente propietario
  SELECT EXISTS(
    SELECT 1 FROM properties 
    WHERE id = property_uuid AND agent_id = user_uuid
  ) INTO is_agent_owner;
  
  RETURN is_agent_owner;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tracking_events_agent_view ON tracking_events(is_agent_view);
CREATE INDEX IF NOT EXISTS idx_tracking_events_unique_view ON tracking_events(is_unique_view);
CREATE INDEX IF NOT EXISTS idx_property_status_history_property ON property_status_history(property_id);
CREATE INDEX IF NOT EXISTS idx_property_status_history_updated_at ON property_status_history(updated_at);

-- 7. CREAR POLÍTICAS RLS PARA property_status_history
ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

-- Los agentes pueden ver el historial de sus propiedades
CREATE POLICY "Agents can view own property status history" ON property_status_history
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE agent_id = auth.uid()
    )
  );

-- Los agentes pueden insertar cambios de estado de sus propiedades
CREATE POLICY "Agents can insert own property status changes" ON property_status_history
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE agent_id = auth.uid()
    )
  );

-- 8. ACTUALIZAR ESTADÍSTICAS DE PROPIEDADES EXISTENTES
-- Recalcular métricas excluyendo vistas de agentes
UPDATE property_analytics 
SET 
  total_views = (
    SELECT COUNT(*) 
    FROM tracking_events 
    WHERE property_id = property_analytics.property_id 
    AND event_type = 'view' 
    AND is_agent_view = FALSE
  ),
  unique_views = (
    SELECT COUNT(*) 
    FROM tracking_events 
    WHERE property_id = property_analytics.property_id 
    AND event_type = 'view' 
    AND is_unique_view = TRUE 
    AND is_agent_view = FALSE
  ),
  contacts_initiated = (
    SELECT COUNT(*) 
    FROM tracking_events 
    WHERE property_id = property_analytics.property_id 
    AND event_type = 'contact' 
    AND is_agent_view = FALSE
  ),
  last_updated = NOW();

-- 9. CREAR FUNCIÓN PARA AUTO-EXPIRAR PROPIEDADES
CREATE OR REPLACE FUNCTION auto_expire_properties()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE properties 
  SET 
    status = 'expired',
    status_updated_at = NOW()
  WHERE 
    status = 'active' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
    
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 10. CREAR VISTA PARA MÉTRICAS DE DASHBOARD
CREATE OR REPLACE VIEW agent_dashboard_metrics AS
SELECT 
  p.agent_id,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_properties,
  COUNT(CASE WHEN p.status = 'draft' THEN 1 END) as draft_properties,
  COUNT(CASE WHEN p.status = 'paused' THEN 1 END) as paused_properties,
  COUNT(CASE WHEN p.status = 'sold' THEN 1 END) as sold_properties,
  COUNT(CASE WHEN p.status = 'expired' THEN 1 END) as expired_properties,
  COALESCE(SUM(pa.total_views), 0) as total_views,
  COALESCE(SUM(pa.unique_views), 0) as total_unique_views,
  COALESCE(SUM(pa.contacts_initiated), 0) as total_contacts,
  COALESCE(SUM(pa.visits_scheduled), 0) as total_visits,
  ROUND(
    CASE 
      WHEN SUM(pa.total_views) > 0 
      THEN (SUM(pa.contacts_initiated)::decimal / SUM(pa.total_views)::decimal) * 100 
      ELSE 0 
    END, 2
  ) as conversion_rate
FROM properties p
LEFT JOIN property_analytics pa ON p.id = pa.property_id
GROUP BY p.agent_id;

-- 11. CREAR RLS PARA LA VISTA
ALTER VIEW agent_dashboard_metrics OWNER TO postgres;

-- 12. VERIFICAR ESTRUCTURA FINAL
SELECT 'NUEVAS COLUMNAS EN tracking_events:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tracking_events' 
AND column_name IN ('is_unique_view', 'is_agent_view');

SELECT 'TABLA property_status_history CREADA:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'property_status_history'
ORDER BY ordinal_position;

SELECT '🎯 SISTEMA DE MÉTRICAS MEJORADO COMPLETADO' as resultado;
