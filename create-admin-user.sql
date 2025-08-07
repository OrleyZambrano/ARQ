-- =====================================================
-- Crear Usuario Administrador en Supabase
-- =====================================================

-- INSTRUCCIONES:
-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Después ve a Supabase Auth y crea manualmente el usuario:
--    Email: admin@propfinder.com
--    Password: admin123
-- 3. Copia el UUID del usuario creado y actualiza el INSERT abajo

-- PASO 1: Crear el usuario admin manualmente en Supabase Auth
-- Ve a Authentication > Users > Add User
-- Email: admin@propfinder.com
-- Password: admin123
-- Confirma el email automáticamente

-- PASO 2: Después de crear el usuario, ejecuta este script
-- (Reemplaza 'USER_UUID_AQUI' con el UUID real del usuario creado)

INSERT INTO public.user_profiles (
  id, 
  email, 
  full_name, 
  role,
  created_at,
  updated_at
) VALUES (
  'USER_UUID_AQUI', -- Reemplaza con el UUID del usuario creado en Auth
  'admin@propfinder.com',
  'Administrador PropFinder',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Administrador PropFinder',
  updated_at = NOW();

-- Verificar que el usuario se creó correctamente
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.created_at
FROM public.user_profiles up
WHERE up.email = 'admin@propfinder.com';

-- =====================================================
-- INSTRUCCIONES IMPORTANTES:
-- =====================================================
-- 1. Primero crea el usuario en Authentication > Users
-- 2. Copia su UUID 
-- 3. Reemplaza 'USER_UUID_AQUI' con el UUID real
-- 4. Ejecuta este script
-- 5. ¡Ya podrás hacer login con admin@propfinder.com / admin123!
-- =====================================================
