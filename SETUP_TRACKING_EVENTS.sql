-- =====================================================
-- CONFIGURACIÓN DE TABLA TRACKING_EVENTS
-- =====================================================
-- Este script crea la tabla tracking_events si no existe
-- y configura las políticas RLS necesarias

-- Crear tabla tracking_events
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  session_id UUID NOT NULL, -- Para agrupar eventos de la misma sesión
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'contact', 'chat', 'visit_request', 'favorite', 'unfavorite', 'exit', 'share')),
  source TEXT DEFAULT 'direct' CHECK (source IN ('search', 'map', 'direct', 'social', 'email', 'referral')),
  user_agent TEXT,
  ip_address INET,
  referrer_url TEXT,
  page_url TEXT,
  duration INTEGER, -- Para eventos 'exit', tiempo en segundos
  is_unique_view BOOLEAN DEFAULT FALSE, -- Para eventos 'view', si es vista única
  additional_data JSONB DEFAULT '{}', -- Datos extra como filtros aplicados, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_tracking_events_property ON public.tracking_events (property_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON public.tracking_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session ON public.tracking_events (session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user ON public.tracking_events (user_id) WHERE user_id IS NOT NULL;

-- Política RLS: Permitir insertar eventos de tracking (necesario para métricas)
DROP POLICY IF EXISTS "Allow tracking events insert" ON public.tracking_events;
CREATE POLICY "Allow tracking events insert" ON public.tracking_events
  FOR INSERT WITH CHECK (true);

-- Política RLS: Los agentes pueden ver eventos de sus propiedades
DROP POLICY IF EXISTS "Agents can view own property tracking" ON public.tracking_events;
CREATE POLICY "Agents can view own property tracking" ON public.tracking_events
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agent_id = auth.uid()
    )
  );

-- Los usuarios pueden ver sus propios eventos
DROP POLICY IF EXISTS "Users can view own tracking events" ON public.tracking_events;
CREATE POLICY "Users can view own tracking events" ON public.tracking_events
  FOR SELECT USING (user_id = auth.uid());

-- Los administradores pueden ver todos los eventos
DROP POLICY IF EXISTS "Admins can view all tracking events" ON public.tracking_events;
CREATE POLICY "Admins can view all tracking events" ON public.tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verificar que la tabla fue creada correctamente
SELECT 
  'tracking_events' as tabla_creada,
  COUNT(*) as registros_actuales
FROM public.tracking_events;

-- Mostrar las políticas RLS creadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'tracking_events'
ORDER BY policyname;
