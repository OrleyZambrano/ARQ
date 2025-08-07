-- =====================================================
-- SCRIPT PARA AGREGAR COLUMNAS FALTANTES Y CORREGIR ESTRUCTURA
-- =====================================================

-- 1. AGREGAR COLUMNA publicaciones_disponibles A user_profiles SI NO EXISTE
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS publicaciones_disponibles INTEGER DEFAULT 10;

-- 2. CREAR TABLA agents SI NO EXISTE
CREATE TABLE IF NOT EXISTS agents (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    approval_status TEXT DEFAULT 'approved',
    publicaciones_disponibles INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR RLS EN agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS BÁSICAS PARA agents
DROP POLICY IF EXISTS "Users can view own agent profile" ON agents;
CREATE POLICY "Users can view own agent profile" ON agents
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own agent profile" ON agents;
CREATE POLICY "Users can update own agent profile" ON agents
    FOR UPDATE USING (auth.uid() = id);

-- 5. INSERTAR REGISTROS EN agents PARA USUARIOS AGENT QUE NO LOS TENGAN
INSERT INTO agents (id, approval_status, publicaciones_disponibles)
SELECT 
    up.id,
    'approved' as approval_status,
    10 as publicaciones_disponibles
FROM user_profiles up
WHERE up.role = 'agent'
AND NOT EXISTS (SELECT 1 FROM agents WHERE agents.id = up.id)
ON CONFLICT (id) DO NOTHING;

-- 6. ACTUALIZAR publicaciones_disponibles EN user_profiles
UPDATE user_profiles 
SET publicaciones_disponibles = 10
WHERE role = 'agent' AND (publicaciones_disponibles IS NULL OR publicaciones_disponibles <= 0);

-- 7. ACTUALIZAR publicaciones_disponibles EN agents
UPDATE agents 
SET publicaciones_disponibles = 10
WHERE publicaciones_disponibles <= 0;

-- 8. VERIFICAR RESULTADO FINAL
SELECT 'ESTADO FINAL - USER_PROFILES:' as info;
SELECT 
    id,
    email,
    full_name,
    role,
    publicaciones_disponibles,
    created_at
FROM user_profiles 
WHERE role = 'agent'
ORDER BY email;

SELECT 'ESTADO FINAL - AGENTS:' as info;
SELECT 
    a.id,
    up.email,
    a.approval_status,
    a.publicaciones_disponibles,
    a.created_at
FROM agents a
JOIN user_profiles up ON up.id = a.id
ORDER BY up.email;

-- 9. VERIFICAR ESTRUCTURA FINAL
SELECT 'COLUMNAS EN user_profiles:' as info;
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'COLUMNAS EN agents:' as info;
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'agents' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '🚀 ESTRUCTURA Y DATOS COMPLETAMENTE CONFIGURADOS' as resultado;
