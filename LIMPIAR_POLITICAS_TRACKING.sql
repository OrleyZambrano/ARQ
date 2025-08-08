-- =====================================================
-- LIMPIAR POLÍTICAS DUPLICADAS EN TRACKING_EVENTS
-- =====================================================
-- Este script elimina políticas duplicadas y deja solo las necesarias

-- Eliminar políticas duplicadas/obsoletas
DROP POLICY IF EXISTS "Anyone can insert tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Users can view their own tracking events" ON public.tracking_events;

-- Verificar las políticas que quedan activas
SELECT 
  tablename,
  policyname,
  cmd,
  qual as condition
FROM pg_policies 
WHERE tablename = 'tracking_events'
ORDER BY policyname;

-- Resultado esperado (solo estas 4 políticas):
-- 1. "Admins can view all tracking events" (SELECT)
-- 2. "Agents can view own property tracking" (SELECT) 
-- 3. "Allow tracking events insert" (INSERT)
-- 4. "Users can view own tracking events" (SELECT)
