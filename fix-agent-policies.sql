-- =====================================================
-- Corregir Políticas de Seguridad para Agentes
-- =====================================================

-- PROBLEMA: Error 401 en user_profiles y agents
-- SOLUCION: Ajustar políticas RLS para permitir operaciones necesarias

-- 1. Política para que usuarios puedan insertar sus propios perfiles
DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON public.user_profiles;
CREATE POLICY "Permitir inserción de perfiles" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Política para que usuarios puedan actualizar sus propios perfiles  
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios perfiles" ON public.user_profiles;
CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Política para que usuarios puedan ver sus propios perfiles
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios perfiles" ON public.user_profiles;
CREATE POLICY "Los usuarios pueden ver sus propios perfiles" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 3.1. Política adicional para que ADMINS puedan ver TODOS los perfiles
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.user_profiles;
CREATE POLICY "Los admins pueden ver todos los perfiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- 3.2. Política para que ADMINS puedan actualizar roles de usuarios
DROP POLICY IF EXISTS "Los admins pueden actualizar roles" ON public.user_profiles;
CREATE POLICY "Los admins pueden actualizar roles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- 4. Política para insertar en agents (solo el propio usuario)
DROP POLICY IF EXISTS "Permitir inserción de agentes" ON public.agents;
CREATE POLICY "Permitir inserción de agentes" ON public.agents
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Política para actualizar agents (solo el propio usuario)
DROP POLICY IF EXISTS "Los agentes pueden actualizar sus propios datos" ON public.agents;
CREATE POLICY "Los agentes pueden actualizar sus propios datos" ON public.agents
  FOR UPDATE USING (auth.uid() = id);

-- 6. Política para ver agents (solo el propio usuario)
DROP POLICY IF EXISTS "Los agentes pueden ver sus propios datos" ON public.agents;
CREATE POLICY "Los agentes pueden ver sus propios datos" ON public.agents
  FOR SELECT USING (auth.uid() = id);

-- 7. Agregar campo de estado de aprobación en agents
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 8. Agregar campo de fecha de aplicación
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 9. Agregar campo de admin que aprobó/rechazó
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- 10. Agregar campo de notas de aprobación
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- 10.1. CRÍTICO: Verificar y corregir foreign key de agents.id
-- La tabla agents debe referenciar correctamente a user_profiles, no a auth.users
-- Primero eliminamos la constraint incorrecta si existe
DO $$ 
BEGIN
    -- Eliminar constraint incorrecta si existe
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'agents_id_fkey' 
               AND table_name = 'agents') THEN
        ALTER TABLE public.agents DROP CONSTRAINT agents_id_fkey;
    END IF;
    
    -- Crear la constraint correcta
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'agents_user_profiles_fkey' 
                   AND table_name = 'agents') THEN
        ALTER TABLE public.agents 
        ADD CONSTRAINT agents_user_profiles_fkey 
        FOREIGN KEY (id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 11. Política para que ADMINS puedan ver TODAS las aplicaciones de agentes
DROP POLICY IF EXISTS "Los admins pueden ver todas las aplicaciones" ON public.agents;
CREATE POLICY "Los admins pueden ver todas las aplicaciones" ON public.agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- 12. Política para que ADMINS puedan actualizar el estado de aprobación
DROP POLICY IF EXISTS "Los admins pueden aprobar/rechazar agentes" ON public.agents;
CREATE POLICY "Los admins pueden aprobar/rechazar agentes" ON public.agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- 13. CRÍTICO: Habilitar RLS en todas las tablas si no está habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR CAMBIOS
-- =====================================================

-- Ver estructura de user_profiles
SELECT 
    'user_profiles' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver estructura actualizada de agents
SELECT 
    'agents' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver constraints de foreign keys
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('user_profiles', 'agents') 
AND tc.constraint_type = 'FOREIGN KEY';

-- Ver políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'agents')
ORDER BY tablename, policyname;
