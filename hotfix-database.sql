-- =====================================================
-- HOTFIX: Corregir Problemas Críticos de Base de Datos
-- =====================================================

-- PROBLEMA 1: Error 500 en user_profiles 
-- PROBLEMA 2: Foreign key constraint "agents_user_profiles_fkey"
-- PROBLEMA 3: Error 409 en inserción de agents

-- =====================================================
-- PASO 1: LIMPIAR POLÍTICAS EXISTENTES
-- =====================================================

-- Deshabilitar RLS temporalmente para hacer cambios
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios perfiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios perfiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Los admins pueden actualizar roles" ON public.user_profiles;

-- Eliminar políticas con nombres en inglés también
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_all" ON public.user_profiles;

DROP POLICY IF EXISTS "Permitir inserción de agentes" ON public.agents;
DROP POLICY IF EXISTS "Los agentes pueden actualizar sus propios datos" ON public.agents;
DROP POLICY IF EXISTS "Los agentes pueden ver sus propios datos" ON public.agents;
DROP POLICY IF EXISTS "Los admins pueden ver todas las aplicaciones" ON public.agents;
DROP POLICY IF EXISTS "Los admins pueden aprobar/rechazar agentes" ON public.agents;

-- Eliminar políticas de agents con nombres en inglés también
DROP POLICY IF EXISTS "agents_select_own" ON public.agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.agents;
DROP POLICY IF EXISTS "agents_admin_select" ON public.agents;
DROP POLICY IF EXISTS "agents_admin_update" ON public.agents;
DROP POLICY IF EXISTS "agents_admin_insert" ON public.agents;
DROP POLICY IF EXISTS "agents_admin_all" ON public.agents;

-- =====================================================
-- PASO 2: CORREGIR ESTRUCTURA DE TABLAS
-- =====================================================

-- Eliminar constraint problemática de agents si existe
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_user_profiles_fkey;
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_id_fkey;

-- Verificar que user_profiles existe y tiene las columnas necesarias
-- (Si no existe, la crearemos)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'agent', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campos first_name y last_name si no existen
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Agregar campos faltantes a agents si no existen
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approved_by UUID;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- AGREGAR CAMPOS PARA MOSTRAR EN LA INTERFAZ ADMIN
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS last_name TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- IMPORTANTE: NO crear foreign key de agents.id -> user_profiles.id
-- En su lugar, agents.id debe ser el UUID del usuario directamente
-- La relación se hace a través de JOINs en las consultas

-- =====================================================
-- PASO 3: POLÍTICAS RLS CORREGIDAS (SIN RECURSIÓN)
-- =====================================================

-- POLÍTICAS PARA USER_PROFILES - SIN RECURSIÓN
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- POLÍTICA ADMIN SIN RECURSIÓN - usando el JWT directamente
CREATE POLICY "user_profiles_admin_select" ON public.user_profiles
    FOR SELECT USING (
        (auth.jwt() ->> 'email') = 'admin@propfinder.com'
    );

CREATE POLICY "user_profiles_admin_insert" ON public.user_profiles
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'email') = 'admin@propfinder.com'
    );

CREATE POLICY "user_profiles_admin_update" ON public.user_profiles
    FOR UPDATE USING (
        (auth.jwt() ->> 'email') = 'admin@propfinder.com'
    );

-- POLÍTICAS PARA AGENTS - SIN RECURSIÓN
CREATE POLICY "agents_select_own" ON public.agents
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "agents_insert_own" ON public.agents
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "agents_update_own" ON public.agents
    FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS ADMIN PARA AGENTS - SIN RECURSIÓN
CREATE POLICY "agents_admin_select" ON public.agents
    FOR SELECT USING (
        (auth.jwt() ->> 'email') = 'admin@propfinder.com'
    );

CREATE POLICY "agents_admin_insert" ON public.agents
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'email') = 'admin@propfinder.com'
    );

CREATE POLICY "agents_admin_update" ON public.agents
    FOR UPDATE USING (
        (auth.jwt() ->> 'email') = 'admin@propfinder.com'
    );

-- =====================================================
-- PASO 4: HABILITAR RLS
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 5: VERIFICACIÓN
-- =====================================================

-- Verificar estructura de user_profiles
SELECT 'user_profiles' as tabla, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de agents  
SELECT 'agents' as tabla, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'agents')
ORDER BY tablename, policyname;

-- =====================================================
-- PASO 6: DATOS DE PRUEBA Y CORRECCIONES
-- =====================================================

-- Crear un usuario admin de prueba si no existe
-- NOTA: Usando tu email admin@propfinder.com
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@propfinder.com' LIMIT 1),
    'admin@propfinder.com',
    'Administrador PropFinder',
    'admin'
) ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- CORREGIR APLICACIONES EXISTENTES SIN NOMBRE COMPLETO
-- Actualizar registros de agents que no tienen full_name pero sí tienen email
UPDATE public.agents 
SET 
    full_name = COALESCE(
        (SELECT up.full_name FROM public.user_profiles up WHERE up.id = agents.id AND up.full_name IS NOT NULL AND up.full_name != ''),
        (SELECT CONCAT(up.first_name, ' ', up.last_name) FROM public.user_profiles up WHERE up.id = agents.id AND up.first_name IS NOT NULL),
        (SELECT u.raw_user_meta_data->>'full_name' FROM auth.users u WHERE u.id = agents.id),
        (SELECT u.raw_user_meta_data->>'name' FROM auth.users u WHERE u.id = agents.id),
        SPLIT_PART(agents.email, '@', 1),
        'Usuario'
    ),
    first_name = COALESCE(
        (SELECT up.first_name FROM public.user_profiles up WHERE up.id = agents.id AND up.first_name IS NOT NULL),
        (SELECT u.raw_user_meta_data->>'first_name' FROM auth.users u WHERE u.id = agents.id),
        SPLIT_PART(agents.email, '@', 1)
    ),
    last_name = COALESCE(
        (SELECT up.last_name FROM public.user_profiles up WHERE up.id = agents.id AND up.last_name IS NOT NULL),
        (SELECT u.raw_user_meta_data->>'last_name' FROM auth.users u WHERE u.id = agents.id),
        ''
    )
WHERE (full_name IS NULL OR full_name = '') 
  AND email IS NOT NULL;

-- Actualizar registros de agents que no tienen email
UPDATE public.agents 
SET email = (SELECT email FROM auth.users WHERE id = agents.id)
WHERE email IS NULL;

-- Mensaje de éxito
SELECT '✅ HOTFIX COMPLETADO - Base de datos corregida y aplicaciones actualizadas' as resultado;
