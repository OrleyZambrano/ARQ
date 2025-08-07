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

-- 11. Política para que ADMINS puedan ver TODAS las aplicaciones de agentes
DROP POLICY IF EXISTS "Los admins pueden ver todas las aplicaciones" ON public.agents;
CREATE POLICY "Los admins pueden ver todas las aplicaciones" ON public.agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 12. Política para que ADMINS puedan actualizar el estado de aprobación
DROP POLICY IF EXISTS "Los admins pueden aprobar/rechazar agentes" ON public.agents;
CREATE POLICY "Los admins pueden aprobar/rechazar agentes" ON public.agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- VERIFICAR CAMBIOS
-- =====================================================

-- Ver estructura actualizada de agents
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'agents')
ORDER BY tablename, policyname;
