-- Fix para permisos del bucket property-images
-- Este archivo contiene las políticas necesarias para que las imágenes sean públicamente accesibles

-- 1. Verificar que el bucket existe y es público
SELECT name, public FROM storage.buckets WHERE name = 'property-images';

-- 2. Asegurar que el bucket sea público
UPDATE storage.buckets 
SET public = true 
WHERE name = 'property-images';

-- 3. Crear política para permitir acceso público de lectura
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow public read access',
  'property-images',
  'SELECT',
  '(true)'
) ON CONFLICT (name, bucket_id) DO UPDATE SET
  definition = '(true)';

-- 4. Crear política para permitir subida autenticada
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow authenticated uploads',
  'property-images',
  'INSERT',
  '(auth.role() = ''authenticated'')'
) ON CONFLICT (name, bucket_id) DO UPDATE SET
  definition = '(auth.role() = ''authenticated'')';

-- 5. Crear política para permitir actualización por el propietario
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow user updates',
  'property-images', 
  'UPDATE',
  '(auth.uid()::text = (storage.foldername(name))[1])'
) ON CONFLICT (name, bucket_id) DO UPDATE SET
  definition = '(auth.uid()::text = (storage.foldername(name))[1])';

-- 6. Crear política para permitir eliminación por el propietario
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow user deletes',
  'property-images',
  'DELETE', 
  '(auth.uid()::text = (storage.foldername(name))[1])'
) ON CONFLICT (name, bucket_id) DO UPDATE SET
  definition = '(auth.uid()::text = (storage.foldername(name))[1])';

-- 7. Verificar políticas creadas
SELECT * FROM storage.policies WHERE bucket_id = 'property-images';
