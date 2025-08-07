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
-- PASO 5: VERIFICACIÓN Y DIAGNÓSTICO
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

-- DIAGNÓSTICO: Ver qué datos tenemos en auth.users para el email orleyzambrano30@gmail.com
SELECT 
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'full_name' as meta_full_name,
    raw_user_meta_data->>'name' as meta_name,
    raw_user_meta_data->>'first_name' as meta_first_name,
    raw_user_meta_data->>'last_name' as meta_last_name
FROM auth.users 
WHERE email = 'orleyzambrano30@gmail.com';

-- DIAGNÓSTICO: Ver qué datos tenemos en user_profiles para ese usuario
SELECT 
    up.email,
    up.full_name,
    up.first_name,
    up.last_name,
    up.role
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
WHERE u.email = 'orleyzambrano30@gmail.com';

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

-- CORRECCIÓN AUTOMÁTICA Y ESCALABLE PARA TODOS LOS AGENTES
-- Actualizar nombres usando la mejor información disponible para TODOS los agentes existentes

-- PASO 1: Actualizar user_profiles que no tienen nombres completos
UPDATE public.user_profiles 
SET 
    full_name = COALESCE(
        -- Si ya tiene un nombre válido (no basado en email), mantenerlo
        CASE WHEN full_name IS NOT NULL AND full_name != '' AND full_name NOT LIKE '%@%' THEN full_name END,
        -- Concatenar first_name + last_name si existen
        CASE WHEN first_name IS NOT NULL AND first_name != '' THEN CONCAT(first_name, ' ', COALESCE(last_name, '')) END,
        -- Buscar en metadatos de auth.users
        (SELECT u.raw_user_meta_data->>'full_name' FROM auth.users u WHERE u.id = user_profiles.id AND u.raw_user_meta_data->>'full_name' IS NOT NULL),
        (SELECT u.raw_user_meta_data->>'name' FROM auth.users u WHERE u.id = user_profiles.id AND u.raw_user_meta_data->>'name' IS NOT NULL),
        -- Último recurso: formatear email de manera más amigable
        CASE 
            WHEN email IS NOT NULL THEN 
                INITCAP(REPLACE(SPLIT_PART(email, '@', 1), '.', ' '))
            ELSE 'Usuario'
        END
    ),
    first_name = COALESCE(
        -- Si ya tiene first_name válido, mantenerlo
        CASE WHEN first_name IS NOT NULL AND first_name != '' THEN first_name END,
        -- Buscar en metadatos
        (SELECT u.raw_user_meta_data->>'first_name' FROM auth.users u WHERE u.id = user_profiles.id AND u.raw_user_meta_data->>'first_name' IS NOT NULL),
        -- Extraer del full_name si existe
        (SELECT SPLIT_PART(u.raw_user_meta_data->>'full_name', ' ', 1) FROM auth.users u WHERE u.id = user_profiles.id AND u.raw_user_meta_data->>'full_name' IS NOT NULL),
        -- Último recurso: primera parte del email
        CASE 
            WHEN email IS NOT NULL THEN 
                INITCAP(SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 1))
            ELSE 'Usuario'
        END
    ),
    last_name = COALESCE(
        -- Si ya tiene last_name válido, mantenerlo
        CASE WHEN last_name IS NOT NULL AND last_name != '' THEN last_name END,
        -- Buscar en metadatos
        (SELECT u.raw_user_meta_data->>'last_name' FROM auth.users u WHERE u.id = user_profiles.id AND u.raw_user_meta_data->>'last_name' IS NOT NULL),
        -- Extraer apellido del full_name completo
        (SELECT CASE 
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(u.raw_user_meta_data->>'full_name', ' '), 1) > 1 
            THEN SUBSTRING(u.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN u.raw_user_meta_data->>'full_name') + 1)
            ELSE ''
         END FROM auth.users u WHERE u.id = user_profiles.id AND u.raw_user_meta_data->>'full_name' IS NOT NULL),
        -- Si no hay apellido, dejar vacío
        ''
    ),
    updated_at = NOW()
WHERE id IS NOT NULL;

-- PASO 2: Actualizar tabla agents con información corregida de user_profiles
UPDATE public.agents 
SET 
    full_name = COALESCE(
        -- Prioridad 1: Usar el full_name actualizado de user_profiles
        (SELECT up.full_name FROM public.user_profiles up WHERE up.id = agents.id AND up.full_name IS NOT NULL AND up.full_name != ''),
        -- Prioridad 2: Concatenar first_name + last_name de user_profiles
        (SELECT CONCAT(up.first_name, ' ', COALESCE(up.last_name, '')) FROM public.user_profiles up WHERE up.id = agents.id AND up.first_name IS NOT NULL),
        -- Fallback: formatear email
        CASE 
            WHEN agents.email IS NOT NULL THEN 
                INITCAP(REPLACE(SPLIT_PART(agents.email, '@', 1), '.', ' '))
            ELSE 'Usuario Sin Nombre'
        END
    ),
    first_name = COALESCE(
        (SELECT up.first_name FROM public.user_profiles up WHERE up.id = agents.id AND up.first_name IS NOT NULL),
        CASE 
            WHEN agents.email IS NOT NULL THEN 
                INITCAP(SPLIT_PART(SPLIT_PART(agents.email, '@', 1), '.', 1))
            ELSE 'Usuario'
        END
    ),
    last_name = COALESCE(
        (SELECT up.last_name FROM public.user_profiles up WHERE up.id = agents.id AND up.last_name IS NOT NULL),
        ''
    ),
    email = COALESCE(
        agents.email,
        (SELECT email FROM auth.users WHERE id = agents.id)
    )
WHERE agents.id IS NOT NULL;

-- Mensaje de éxito
SELECT '✅ HOTFIX COMPLETADO - Base de datos corregida automáticamente para todos los usuarios' as resultado;
