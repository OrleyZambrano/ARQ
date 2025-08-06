-- =====================================================
-- PropFinder - Configuración Completa de Base de Datos
-- Supabase PostgreSQL Setup con RLS y Chat en Tiempo Real
-- =====================================================

-- Primero, habilitamos las extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para funcionalidades geoespaciales

-- =====================================================
-- 1. TABLAS PRINCIPALES DEL SISTEMA
-- =====================================================

-- Tabla de usuarios base (Supabase Auth maneja auth.users, pero necesitamos perfiles)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'agent', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla específica para agentes (extiende user_profiles)
CREATE TABLE public.agents (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  credits INTEGER DEFAULT 0,
  total_credits_used INTEGER DEFAULT 0,
  free_publications_used INTEGER DEFAULT 0, -- NUEVO: Publicaciones gratis usadas
  is_new_agent BOOLEAN DEFAULT TRUE, -- NUEVO: Elegible para bonus
  license_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  description TEXT,
  company_name TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de propiedades
CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'commercial', 'land')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'paused', 'sold', 'rented')),
  is_free_publication BOOLEAN DEFAULT FALSE, -- NUEVO: Marca publicaciones gratis
  
  -- Ubicación
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Colombia',
  coordinates GEOGRAPHY(POINT, 4326), -- PostGIS para coordenadas
  
  -- Características de la propiedad
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_m2 DECIMAL(8,2),
  parking_spaces INTEGER DEFAULT 0,
  year_built INTEGER,
  
  -- Características especiales (JSONB para flexibilidad)
  features JSONB DEFAULT '{}', -- {pool: true, garden: true, furnished: false, etc.}
  
  -- Fechas importantes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para gestionar imágenes en Supabase Storage
CREATE TABLE public.property_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL, -- Ruta en el bucket de Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_primary BOOLEAN DEFAULT FALSE, -- Imagen principal de la propiedad
  display_order INTEGER DEFAULT 0, -- Orden de visualización
  alt_text TEXT, -- Texto alternativo para accesibilidad
  upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('uploading', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para imágenes de chat (archivos compartidos)
CREATE TABLE public.chat_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL, -- Ruta en el bucket de Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_image BOOLEAN DEFAULT FALSE, -- Si es imagen para preview
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para avatares de usuarios
CREATE TABLE public.user_avatars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  storage_path TEXT NOT NULL, -- Ruta en el bucket de Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SISTEMA DE CHAT EN TIEMPO REAL
-- =====================================================

-- Sesiones de chat
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar sesiones duplicadas para la misma propiedad y comprador
  UNIQUE(property_id, buyer_id)
);

-- Mensajes de chat
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  has_attachments BOOLEAN DEFAULT FALSE, -- Si tiene archivos adjuntos
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SISTEMA DE CITAS/AGENDAMIENTO
-- =====================================================

CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  buyer_notes TEXT,
  agent_notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SISTEMA DE ANALYTICS Y TRACKING
-- =====================================================

-- Analytics por propiedad (resumen)
CREATE TABLE public.property_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  contacts_initiated INTEGER DEFAULT 0, -- Cuántas personas contactaron
  chats_started INTEGER DEFAULT 0,
  visits_scheduled INTEGER DEFAULT 0,
  times_favorited INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- en segundos
  
  -- Fuentes de tráfico
  traffic_search INTEGER DEFAULT 0,
  traffic_map INTEGER DEFAULT 0,
  traffic_direct INTEGER DEFAULT 0,
  traffic_social INTEGER DEFAULT 0,
  
  -- Tasas de conversión calculadas
  conversion_view_to_contact DECIMAL(5,2) DEFAULT 0.00,
  conversion_view_to_visit DECIMAL(5,2) DEFAULT 0.00,
  conversion_contact_to_visit DECIMAL(5,2) DEFAULT 0.00,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos detallados de tracking
CREATE TABLE public.tracking_events (
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
  additional_data JSONB DEFAULT '{}', -- Datos extra como filtros aplicados, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SISTEMA DE FAVORITOS
-- =====================================================

CREATE TABLE public.user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede agregar una propiedad a favoritos una vez
  UNIQUE(user_id, property_id)
);

-- =====================================================
-- 6. SISTEMA DE PAGOS Y TRANSACCIONES
-- =====================================================

-- Planes de publicación disponibles
CREATE TABLE public.publication_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL(8,2) NOT NULL,
  credits INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transacciones de pago
CREATE TABLE public.payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.publication_plans(id) ON DELETE SET NULL,
  amount DECIMAL(8,2) NOT NULL,
  credits_awarded INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'paypal')),
  transaction_id TEXT UNIQUE NOT NULL, -- ID de la pasarela externa
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Historial de uso de créditos
CREATE TABLE public.credit_usage_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  credits_used INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('publish', 'renew', 'promote')),
  is_free_publication BOOLEAN DEFAULT FALSE, -- Si usó publicación gratis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SISTEMA DE NOTIFICACIONES
-- =====================================================

CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chat', 'appointment', 'property', 'payment', 'system')),
  data JSONB DEFAULT '{}', -- Datos adicionales como IDs relacionados
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. CONFIGURACIÓN DE ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para búsquedas geoespaciales
CREATE INDEX idx_properties_coordinates ON public.properties USING GIST (coordinates);
CREATE INDEX idx_properties_location ON public.properties (city, state);
CREATE INDEX idx_properties_agent_status ON public.properties (agent_id, status);
CREATE INDEX idx_properties_type_transaction ON public.properties (property_type, transaction_type, status);
CREATE INDEX idx_properties_price ON public.properties (price);
CREATE INDEX idx_properties_published ON public.properties (published_at DESC) WHERE status = 'active';

-- Índices para chat
CREATE INDEX idx_chat_sessions_property_buyer ON public.chat_sessions (property_id, buyer_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages (session_id, created_at);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages (sender_id);

-- Índices para analytics
CREATE INDEX idx_tracking_events_property ON public.tracking_events (property_id);
CREATE INDEX idx_tracking_events_created_at ON public.tracking_events (created_at DESC);
CREATE INDEX idx_tracking_events_session ON public.tracking_events (session_id);
CREATE INDEX idx_tracking_events_user ON public.tracking_events (user_id) WHERE user_id IS NOT NULL;

-- Índices para imágenes y archivos
CREATE INDEX idx_property_images_property ON public.property_images (property_id);
CREATE INDEX idx_property_images_primary ON public.property_images (property_id) WHERE is_primary = true;
CREATE INDEX idx_property_images_order ON public.property_images (property_id, display_order);
CREATE INDEX idx_chat_files_message ON public.chat_files (message_id);
CREATE INDEX idx_user_avatars_user ON public.user_avatars (user_id);

-- =====================================================
-- 9. FUNCIONES Y TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_avatars_updated_at BEFORE UPDATE ON public.user_avatars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar analytics automáticamente
CREATE OR REPLACE FUNCTION update_property_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear registro de analytics si no existe
  INSERT INTO public.property_analytics (property_id)
  VALUES (NEW.property_id)
  ON CONFLICT (property_id) DO NOTHING;

  -- Actualizar contadores según el tipo de evento
  UPDATE public.property_analytics SET
    total_views = total_views + CASE WHEN NEW.event_type = 'view' THEN 1 ELSE 0 END,
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar analytics
CREATE TRIGGER trigger_update_property_analytics
  AFTER INSERT ON public.tracking_events
  FOR EACH ROW EXECUTE FUNCTION update_property_analytics();

-- Función para calcular tasas de conversión
CREATE OR REPLACE FUNCTION calculate_conversion_rates()
RETURNS VOID AS $$
BEGIN
  UPDATE public.property_analytics SET
    conversion_view_to_contact = CASE 
      WHEN total_views > 0 THEN ROUND((contacts_initiated::decimal / total_views::decimal) * 100, 2)
      ELSE 0 
    END,
    conversion_view_to_visit = CASE 
      WHEN total_views > 0 THEN ROUND((visits_scheduled::decimal / total_views::decimal) * 100, 2)
      ELSE 0 
    END,
    conversion_contact_to_visit = CASE 
      WHEN contacts_initiated > 0 THEN ROUND((visits_scheduled::decimal / contacts_initiated::decimal) * 100, 2)
      ELSE 0 
    END,
    last_updated = NOW()
  WHERE last_updated < NOW() - INTERVAL '1 hour'; -- Solo actualizar si han pasado más de 1 hora
END;
$$ LANGUAGE plpgsql;

-- Función para verificar elegibilidad de publicación gratis
CREATE OR REPLACE FUNCTION can_use_free_publication(agent_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  agent_record RECORD;
BEGIN
  SELECT free_publications_used, is_new_agent, is_verified
  INTO agent_record
  FROM public.agents
  WHERE id = agent_uuid;

  -- Puede usar gratis si: es nuevo, está verificado y no ha usado las 2 gratis
  RETURN agent_record.is_new_agent
         AND agent_record.is_verified
         AND agent_record.free_publications_used < 2;
END;
$$ LANGUAGE plpgsql;

-- Función para usar publicación gratis
CREATE OR REPLACE FUNCTION use_free_publication(agent_uuid UUID, property_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  can_use BOOLEAN;
BEGIN
  -- Verificar si puede usar gratis
  SELECT can_use_free_publication(agent_uuid) INTO can_use;
  
  IF NOT can_use THEN
    RETURN FALSE;
  END IF;

  -- Marcar propiedad como publicación gratis y activarla
  UPDATE public.properties
  SET 
    is_free_publication = TRUE,
    status = 'active',
    published_at = NOW(),
    expires_at = NOW() + INTERVAL '60 days'
  WHERE id = property_uuid AND agent_id = agent_uuid;

  -- Incrementar contador de publicaciones gratis usadas
  UPDATE public.agents
  SET 
    free_publications_used = free_publications_used + 1,
    is_new_agent = CASE WHEN free_publications_used + 1 >= 2 THEN FALSE ELSE is_new_agent END
  WHERE id = agent_uuid;

  -- Registrar en el historial de créditos
  INSERT INTO public.credit_usage_history (agent_id, property_id, credits_used, action_type, is_free_publication)
  VALUES (agent_uuid, property_uuid, 0, 'publish', TRUE);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para usar crédito regular
CREATE OR REPLACE FUNCTION use_credit_for_publication(agent_uuid UUID, property_uuid UUID, duration_days INTEGER DEFAULT 90)
RETURNS BOOLEAN AS $$
DECLARE
  agent_credits INTEGER;
BEGIN
  -- Verificar créditos disponibles
  SELECT credits INTO agent_credits FROM public.agents WHERE id = agent_uuid;
  
  IF agent_credits < 1 THEN
    RETURN FALSE;
  END IF;

  -- Activar propiedad
  UPDATE public.properties
  SET 
    status = 'active',
    published_at = NOW(),
    expires_at = NOW() + (duration_days || ' days')::INTERVAL
  WHERE id = property_uuid AND agent_id = agent_uuid;

  -- Descontar crédito
  UPDATE public.agents
  SET 
    credits = credits - 1,
    total_credits_used = total_credits_used + 1
  WHERE id = agent_uuid;

  -- Registrar en el historial
  INSERT INTO public.credit_usage_history (agent_id, property_id, credits_used, action_type)
  VALUES (agent_uuid, property_uuid, 1, 'publish');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar última actividad de chat
CREATE OR REPLACE FUNCTION update_chat_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar actividad de chat
CREATE TRIGGER trigger_update_chat_activity
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_session_activity();

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLÍTICAS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS PARA USER_PROFILES =====
-- Los usuarios pueden ver y actualizar su propio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permitir insert cuando se crea una cuenta
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===== POLÍTICAS PARA AGENTS =====
-- Los agentes pueden ver y actualizar su propio registro
CREATE POLICY "Agents can manage own data" ON public.agents
  FOR ALL USING (auth.uid() = id);

-- Cualquiera puede ver información básica de agentes verificados
CREATE POLICY "Public can view verified agents" ON public.agents
  FOR SELECT USING (is_verified = true);

-- ===== POLÍTICAS PARA PROPERTIES =====
-- Cualquiera puede ver propiedades activas
CREATE POLICY "Anyone can view active properties" ON public.properties
  FOR SELECT USING (status = 'active');

-- Los agentes pueden gestionar sus propias propiedades
CREATE POLICY "Agents can manage own properties" ON public.properties
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE id = auth.uid()
    )
  );

-- ===== POLÍTICAS PARA PROPERTY_IMAGES =====
-- Cualquiera puede ver imágenes de propiedades activas
CREATE POLICY "Anyone can view images of active properties" ON public.property_images
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.properties WHERE status = 'active'
    )
  );

-- Los agentes pueden gestionar imágenes de sus propiedades
CREATE POLICY "Agents can manage own property images" ON public.property_images
  FOR ALL USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agent_id = auth.uid()
    )
  );

-- ===== POLÍTICAS PARA USER_AVATARS =====
-- Los usuarios pueden ver y gestionar su propio avatar
CREATE POLICY "Users can manage own avatar" ON public.user_avatars
  FOR ALL USING (user_id = auth.uid());

-- Cualquiera puede ver avatares de agentes verificados
CREATE POLICY "Anyone can view verified agent avatars" ON public.user_avatars
  FOR SELECT USING (
    user_id IN (
      SELECT up.id FROM public.user_profiles up
      JOIN public.agents a ON up.id = a.id
      WHERE a.is_verified = true
    )
  );

-- ===== POLÍTICAS PARA CHAT_SESSIONS =====
-- Solo los participantes pueden ver las sesiones de chat
CREATE POLICY "Participants can view chat sessions" ON public.chat_sessions
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    agent_id = auth.uid()
  );

-- Los compradores pueden crear nuevas sesiones
CREATE POLICY "Buyers can create chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('buyer', 'admin'))
  );

-- Los participantes pueden cerrar sesiones
CREATE POLICY "Participants can update chat sessions" ON public.chat_sessions
  FOR UPDATE USING (
    buyer_id = auth.uid() OR 
    agent_id = auth.uid()
  );

-- ===== POLÍTICAS PARA CHAT_MESSAGES =====
-- Solo los participantes pueden ver mensajes
CREATE POLICY "Participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.chat_sessions 
      WHERE buyer_id = auth.uid() OR agent_id = auth.uid()
    )
  );

-- Solo los participantes pueden enviar mensajes
CREATE POLICY "Participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    session_id IN (
      SELECT id FROM public.chat_sessions 
      WHERE buyer_id = auth.uid() OR agent_id = auth.uid()
    )
  );

-- ===== POLÍTICAS PARA CHAT_FILES =====
-- Solo los participantes pueden ver archivos del chat
CREATE POLICY "Participants can view chat files" ON public.chat_files
  FOR SELECT USING (
    message_id IN (
      SELECT cm.id FROM public.chat_messages cm
      JOIN public.chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.buyer_id = auth.uid() OR cs.agent_id = auth.uid()
    )
  );

-- Solo los participantes pueden subir archivos
CREATE POLICY "Participants can upload chat files" ON public.chat_files
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT cm.id FROM public.chat_messages cm
      JOIN public.chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.buyer_id = auth.uid() OR cs.agent_id = auth.uid()
    )
  );

-- ===== POLÍTICAS PARA APPOINTMENTS =====
-- Los participantes pueden ver sus citas
CREATE POLICY "Participants can view appointments" ON public.appointments
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    agent_id = auth.uid()
  );

-- Los compradores pueden crear citas
CREATE POLICY "Buyers can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Los participantes pueden actualizar citas
CREATE POLICY "Participants can update appointments" ON public.appointments
  FOR UPDATE USING (
    buyer_id = auth.uid() OR 
    agent_id = auth.uid()
  );

-- ===== POLÍTICAS PARA PROPERTY_ANALYTICS =====
-- Solo los agentes pueden ver analytics de sus propiedades
CREATE POLICY "Agents can view own property analytics" ON public.property_analytics
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agent_id = auth.uid()
    )
  );

-- Los agentes pueden insertar/actualizar analytics de sus propiedades
CREATE POLICY "Agents can manage own analytics" ON public.property_analytics
  FOR ALL USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agent_id = auth.uid()
    )
  );

-- ===== POLÍTICAS PARA TRACKING_EVENTS =====
-- Permitir insertar eventos de tracking (necesario para métricas)
CREATE POLICY "Allow tracking events insert" ON public.tracking_events
  FOR INSERT WITH CHECK (true);

-- Los agentes pueden ver eventos de sus propiedades
CREATE POLICY "Agents can view own property tracking" ON public.tracking_events
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agent_id = auth.uid()
    )
  );

-- ===== POLÍTICAS PARA USER_FAVORITES =====
-- Los usuarios pueden gestionar sus propios favoritos
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
  FOR ALL USING (user_id = auth.uid());

-- ===== POLÍTICAS PARA PAYMENT_TRANSACTIONS =====
-- Los agentes solo pueden ver sus propias transacciones
CREATE POLICY "Agents can view own transactions" ON public.payment_transactions
  FOR SELECT USING (agent_id = auth.uid());

-- ===== POLÍTICAS PARA CREDIT_USAGE_HISTORY =====
-- Los agentes solo pueden ver su propio historial
CREATE POLICY "Agents can view own credit history" ON public.credit_usage_history
  FOR SELECT USING (agent_id = auth.uid());

-- ===== POLÍTICAS PARA NOTIFICATIONS =====
-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden marcar sus notificaciones como leídas
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 11. CONFIGURACIÓN SUPABASE STORAGE BUCKETS
-- =====================================================

-- Configuración de buckets (ejecutar desde el dashboard de Supabase o via API)
-- Estos comandos son para referencia, deben ejecutarse desde el dashboard

/*
BUCKETS A CREAR EN SUPABASE DASHBOARD:

1. BUCKET: "property-images"
   - Público: NO (requiere autenticación)
   - Tamaño máximo: 10MB por archivo
   - Tipos permitidos: image/jpeg, image/png, image/webp
   - Transformaciones: Habilitadas (resize, optimize)

2. BUCKET: "chat-files" 
   - Público: NO (solo participantes del chat)
   - Tamaño máximo: 5MB por archivo
   - Tipos permitidos: image/*, application/pdf, text/*

3. BUCKET: "user-avatars"
   - Público: SÍ (con RLS)
   - Tamaño máximo: 2MB por archivo  
   - Tipos permitidos: image/jpeg, image/png, image/webp
   - Transformaciones: Habilitadas (resize a 200x200)
*/

-- ===== POLÍTICAS RLS PARA STORAGE =====
-- Estas políticas van en: Storage > Policies en el dashboard de Supabase

-- POLÍTICAS PARA "property-images" bucket:
/*
Política 1: "Agentes pueden subir imágenes de sus propiedades"
Operación: INSERT
Definición: 
bucket_id = 'property-images' AND 
auth.uid() IN (
  SELECT p.agent_id FROM public.properties p 
  WHERE p.id::text = (storage.foldername(name))[1]
)

Política 2: "Cualquiera puede ver imágenes de propiedades activas"  
Operación: SELECT
Definición:
bucket_id = 'property-images' AND
(storage.foldername(name))[1] IN (
  SELECT p.id::text FROM public.properties p WHERE p.status = 'active'
)

Política 3: "Agentes pueden actualizar/eliminar imágenes de sus propiedades"
Operación: UPDATE, DELETE
Definición:
bucket_id = 'property-images' AND
auth.uid() IN (
  SELECT p.agent_id FROM public.properties p 
  WHERE p.id::text = (storage.foldername(name))[1]
)
*/

-- POLÍTICAS PARA "chat-files" bucket:
/*
Política 1: "Participantes pueden subir archivos"
Operación: INSERT  
Definición:
bucket_id = 'chat-files' AND
auth.uid() IN (
  SELECT cs.buyer_id FROM public.chat_sessions cs
  WHERE cs.id::text = (storage.foldername(name))[1]
  UNION
  SELECT cs.agent_id FROM public.chat_sessions cs  
  WHERE cs.id::text = (storage.foldername(name))[1]
)

Política 2: "Participantes pueden ver archivos del chat"
Operación: SELECT
Definición: 
bucket_id = 'chat-files' AND
auth.uid() IN (
  SELECT cs.buyer_id FROM public.chat_sessions cs
  WHERE cs.id::text = (storage.foldername(name))[1]
  UNION
  SELECT cs.agent_id FROM public.chat_sessions cs
  WHERE cs.id::text = (storage.foldername(name))[1]
)
*/

-- POLÍTICAS PARA "user-avatars" bucket:
/*
Política 1: "Usuarios pueden subir su propio avatar"
Operación: INSERT, UPDATE, DELETE
Definición:
bucket_id = 'user-avatars' AND
auth.uid()::text = (storage.foldername(name))[1]

Política 2: "Cualquiera puede ver avatares"
Operación: SELECT  
Definición:
bucket_id = 'user-avatars'
*/

-- =====================================================
-- 12. CONFIGURACIÓN REALTIME PARA CHAT
-- =====================================================

-- Habilitar Realtime en las tablas de chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================================================
-- 12. DATOS INICIALES (SEEDS)
-- =====================================================

-- Insertar planes de publicación iniciales
INSERT INTO public.publication_plans (name, price, credits, duration_days, description, features) VALUES
('Starter', 10.00, 5, 90, 'Perfecto para agentes que inician', '{"max_images": 10, "featured": false, "priority_support": false}'),
('Professional', 18.00, 10, 90, 'Para agentes con volumen medio', '{"max_images": 20, "featured": true, "priority_support": false}'),
('Premium', 30.00, 20, 120, 'Para agentes establecidos', '{"max_images": 30, "featured": true, "priority_support": true, "analytics_export": true}'),
('Enterprise', 50.00, 50, 120, 'Para agencias grandes', '{"max_images": 50, "featured": true, "priority_support": true, "analytics_export": true, "custom_branding": true}');

-- =====================================================
-- 13. TAREAS PROGRAMADAS (OPCIONAL)
-- =====================================================

-- Función para limpiar datos antiguos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
  -- Eliminar eventos de tracking mayores a 6 meses
  DELETE FROM public.tracking_events 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Cerrar sesiones de chat inactivas por más de 30 días
  UPDATE public.chat_sessions 
  SET status = 'archived'
  WHERE status = 'active' 
    AND last_message_at < NOW() - INTERVAL '30 days';
  
  -- Marcar propiedades expiradas
  UPDATE public.properties 
  SET status = 'expired'
  WHERE status = 'active' 
    AND expires_at < NOW();
  
  -- Recalcular tasas de conversión
  PERFORM calculate_conversion_rates();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. FUNCIONES HELPER PARA EL FRONTEND
-- =====================================================

-- Función para obtener propiedades cerca de un punto
CREATE OR REPLACE FUNCTION get_nearby_properties(
  lat DECIMAL,
  lng DECIMAL,
  radius_km INTEGER DEFAULT 10,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price DECIMAL,
  property_type TEXT,
  address TEXT,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.property_type,
    p.address,
    ROUND((ST_Distance(p.coordinates, ST_MakePoint(lng, lat)::geography) / 1000)::DECIMAL, 2) as distance_km
  FROM public.properties p
  WHERE p.status = 'active'
    AND ST_DWithin(p.coordinates, ST_MakePoint(lng, lat)::geography, radius_km * 1000)
  ORDER BY p.coordinates <-> ST_MakePoint(lng, lat)::geography
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar propiedades con filtros (ACTUALIZADA con imágenes)
CREATE OR REPLACE FUNCTION search_properties(
  search_text TEXT DEFAULT NULL,
  property_type TEXT DEFAULT NULL,
  transaction_type TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  min_bedrooms INTEGER DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price DECIMAL,
  property_type TEXT,
  transaction_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  address TEXT,
  primary_image_path TEXT,
  total_images INTEGER,
  agent_name TEXT,
  agent_avatar_path TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.property_type,
    p.transaction_type,
    p.bedrooms,
    p.bathrooms,
    p.address,
    pi_primary.storage_path as primary_image_path,
    COALESCE(img_count.total, 0)::INTEGER as total_images,
    up.full_name as agent_name,
    ua.storage_path as agent_avatar_path
  FROM public.properties p
  JOIN public.agents a ON p.agent_id = a.id
  JOIN public.user_profiles up ON a.id = up.id
  LEFT JOIN public.property_images pi_primary ON p.id = pi_primary.property_id AND pi_primary.is_primary = true
  LEFT JOIN public.user_avatars ua ON up.id = ua.user_id
  LEFT JOIN (
    SELECT property_id, COUNT(*) as total
    FROM public.property_images
    WHERE upload_status = 'completed'
    GROUP BY property_id
  ) img_count ON p.id = img_count.property_id
  WHERE p.status = 'active'
    AND (search_text IS NULL OR p.title ILIKE '%' || search_text || '%' OR p.description ILIKE '%' || search_text || '%')
    AND (property_type IS NULL OR p.property_type = property_type)
    AND (transaction_type IS NULL OR p.transaction_type = transaction_type)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_bedrooms IS NULL OR p.bedrooms >= min_bedrooms)
    AND (city_filter IS NULL OR p.city ILIKE '%' || city_filter || '%')
  ORDER BY p.published_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener detalles completos de una propiedad con imágenes
CREATE OR REPLACE FUNCTION get_property_details(property_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  property_type TEXT,
  transaction_type TEXT,
  address TEXT,
  city TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_m2 DECIMAL,
  features JSONB,
  agent_name TEXT,
  agent_phone TEXT,
  agent_avatar_path TEXT,
  images JSONB, -- Array de objetos con info de imágenes
  total_views INTEGER,
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.property_type,
    p.transaction_type,
    p.address,
    p.city,
    p.bedrooms,
    p.bathrooms,
    p.area_m2,
    p.features,
    up.full_name as agent_name,
    up.phone as agent_phone,
    ua.storage_path as agent_avatar_path,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pi.id,
            'storage_path', pi.storage_path,
            'file_name', pi.file_name,
            'is_primary', pi.is_primary,
            'display_order', pi.display_order,
            'alt_text', pi.alt_text
          ) ORDER BY pi.display_order, pi.created_at
        )
        FROM public.property_images pi
        WHERE pi.property_id = p.id AND pi.upload_status = 'completed'
      ),
      '[]'::jsonb
    ) as images,
    COALESCE(pa.total_views, 0) as total_views,
    p.published_at
  FROM public.properties p
  JOIN public.agents a ON p.agent_id = a.id
  JOIN public.user_profiles up ON a.id = up.id
  LEFT JOIN public.user_avatars ua ON up.id = ua.user_id
  LEFT JOIN public.property_analytics pa ON p.id = pa.property_id
  WHERE p.id = property_uuid AND p.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para gestionar imágenes de propiedades
CREATE OR REPLACE FUNCTION add_property_image(
  property_uuid UUID,
  storage_path_param TEXT,
  file_name_param TEXT,
  file_size_param INTEGER,
  mime_type_param TEXT,
  is_primary_param BOOLEAN DEFAULT FALSE,
  alt_text_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  image_id UUID;
  next_order INTEGER;
BEGIN
  -- Verificar que el usuario es el propietario de la propiedad
  IF NOT EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_uuid AND p.agent_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para agregar imágenes a esta propiedad';
  END IF;

  -- Si es imagen principal, quitar el flag de las demás
  IF is_primary_param THEN
    UPDATE public.property_images 
    SET is_primary = FALSE 
    WHERE property_id = property_uuid;
  END IF;

  -- Obtener el siguiente orden de visualización
  SELECT COALESCE(MAX(display_order), 0) + 1
  INTO next_order
  FROM public.property_images
  WHERE property_id = property_uuid;

  -- Insertar la nueva imagen
  INSERT INTO public.property_images (
    property_id,
    storage_path,
    file_name,
    file_size,
    mime_type,
    is_primary,
    display_order,
    alt_text
  ) VALUES (
    property_uuid,
    storage_path_param,
    file_name_param,
    file_size_param,
    mime_type_param,
    is_primary_param,
    next_order,
    alt_text_param
  ) RETURNING id INTO image_id;

  RETURN image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ¡SETUP COMPLETO! 
-- =====================================================
-- 
-- PASOS PARA CONFIGURAR:
-- 
-- 1. EJECUTAR SQL:
--    - Ve a tu proyecto Supabase
--    - SQL Editor  
--    - Pega y ejecuta todo este código
--    - Verifica que todas las tablas se crearon correctamente
-- 
-- 2. CONFIGURAR STORAGE BUCKETS:
--    - Ve a Storage en el dashboard de Supabase
--    - Crear bucket "property-images" (privado)
--    - Crear bucket "chat-files" (privado) 
--    - Crear bucket "user-avatars" (público con RLS)
--    - Aplicar las políticas RLS mostradas arriba
-- 
-- 3. CONFIGURAR CLAVES API:
--    - Obtén SUPABASE_URL y SUPABASE_ANON_KEY
--    - Configúralas en tu aplicación frontend
-- 
-- 4. CONFIGURAR TRANSFORMACIONES DE IMÁGENES (OPCIONAL):
--    - Habilitadas automáticamente para optimización
--    - Resize automático para avatares (200x200)
--    - Compresión automática para propiedades
-- 
-- ESTRUCTURA DE CARPETAS EN STORAGE:
-- 
-- property-images/
-- ├── {property-id}/
-- │   ├── image1.jpg
-- │   ├── image2.jpg
-- │   └── ...
-- 
-- chat-files/ 
-- ├── {session-id}/
-- │   ├── file1.pdf
-- │   ├── image1.jpg
-- │   └── ...
-- 
-- user-avatars/
-- ├── {user-id}/
-- │   └── avatar.jpg
-- 
-- FUNCIONALIDADES HABILITADAS:
-- ✅ Autenticación con RLS
-- ✅ Chat en tiempo real con archivos  
-- ✅ Analytics automáticos
-- ✅ Búsqueda geoespacial
-- ✅ Sistema de créditos
-- ✅ Publicaciones gratuitas para nuevos agentes
-- ✅ Tracking completo de métricas
-- ✅ Gestión de imágenes en Supabase Storage
-- ✅ Avatares de usuarios
-- ✅ Archivos adjuntos en chat
-- ✅ Optimización automática de imágenes
-- ✅ Seguridad completa con políticas RLS
-- 
-- =====================================================
