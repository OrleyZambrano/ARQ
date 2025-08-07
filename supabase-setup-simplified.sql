-- =====================================================
-- PropFinder - Setup Básico de Base de Datos
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'agent', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de agentes (extiende user_profiles)
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  credits INTEGER DEFAULT 0,
  total_credits_used INTEGER DEFAULT 0,
  license_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  description TEXT,
  company_name TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP', 'MXN', 'EUR')),
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'commercial', 'land')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  
  -- Ubicación
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Colombia',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Características
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms INTEGER CHECK (bathrooms >= 0),
  area_sqm DECIMAL(10,2) CHECK (area_sqm > 0),
  parking_spaces INTEGER DEFAULT 0 CHECK (parking_spaces >= 0),
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de imágenes de propiedades
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Permitir inserción de perfiles" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para agents
CREATE POLICY "Los agentes pueden ver sus propios datos" ON public.agents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los agentes pueden actualizar sus propios datos" ON public.agents
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Permitir inserción de agentes" ON public.agents
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para properties
CREATE POLICY "Todos pueden ver propiedades activas" ON public.properties
  FOR SELECT USING (is_active = true);

CREATE POLICY "Los agentes pueden gestionar sus propiedades" ON public.properties
  FOR ALL USING (auth.uid() = agent_id);

-- Políticas para property_images
CREATE POLICY "Todos pueden ver imágenes de propiedades activas" ON public.property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_images.property_id 
      AND properties.is_active = true
    )
  );

CREATE POLICY "Los agentes pueden gestionar imágenes de sus propiedades" ON public.property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_images.property_id 
      AND properties.agent_id = auth.uid()
    )
  );

-- Políticas para favorites
CREATE POLICY "Los usuarios pueden ver sus favoritos" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden gestionar sus favoritos" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar agente de ejemplo (requiere usuario autenticado)
-- Este script se ejecutará cuando tengas usuarios reales

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_transaction ON public.properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(latitude, longitude);

-- Índice para imágenes ordenadas
CREATE INDEX IF NOT EXISTS idx_property_images_order ON public.property_images(property_id, display_order);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
