-- =====================================================
-- SCRIPT PARA CORREGIR ESTRUCTURA DE BASE DE DATOS
-- =====================================================

-- 1. Verificar y agregar campos faltantes a la tabla agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_publications_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new_agent BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS publicaciones_disponibles INTEGER DEFAULT 0;

-- 2. Crear tabla payments si no existe
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'premium', 'enterprise')),
    amount DECIMAL(10,2) NOT NULL,
    credits_awarded INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('paypal', 'stripe')),
    transaction_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paypal_details JSONB,
    stripe_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS en payments si existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Crear políticas para payments
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP POLICY IF EXISTS "Agents can view own payments" ON payments;
        CREATE POLICY "Agents can view own payments" ON payments
            FOR SELECT USING (auth.uid() = agent_id);

        DROP POLICY IF EXISTS "Agents can insert own payments" ON payments;
        CREATE POLICY "Agents can insert own payments" ON payments
            FOR INSERT WITH CHECK (auth.uid() = agent_id);
    END IF;
END $$;

-- 5. Función para verificar publicaciones gratis
CREATE OR REPLACE FUNCTION can_use_free_publication(agent_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    agent_record RECORD;
BEGIN
    SELECT 
        free_publications_used,
        is_new_agent,
        is_verified
    INTO agent_record
    FROM public.agents
    WHERE id = agent_uuid;

    -- Si no existe el agente, devolver false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Puede usar gratis si: es nuevo, está verificado y no ha usado las 2 gratis
    RETURN agent_record.is_new_agent
           AND agent_record.is_verified
           AND COALESCE(agent_record.free_publications_used, 0) < 2;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para usar publicación gratis
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
        free_publications_used = COALESCE(free_publications_used, 0) + 1,
        is_new_agent = CASE WHEN COALESCE(free_publications_used, 0) + 1 >= 2 THEN FALSE ELSE is_new_agent END,
        updated_at = NOW()
    WHERE id = agent_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para consumir crédito al publicar (NUEVA)
CREATE OR REPLACE FUNCTION consume_publication(agent_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    agent_credits INTEGER;
BEGIN
    -- Verificar créditos disponibles
    SELECT COALESCE(credits, 0) INTO agent_credits 
    FROM public.agents 
    WHERE id = agent_uuid;
    
    IF agent_credits < 1 THEN
        RETURN FALSE;
    END IF;

    -- Descontar crédito
    UPDATE public.agents
    SET 
        credits = credits - 1,
        total_credits_used = COALESCE(total_credits_used, 0) + 1,
        publicaciones_disponibles = COALESCE(publicaciones_disponibles, 0) - 1,
        updated_at = NOW()
    WHERE id = agent_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para activar propiedad con crédito (NUEVA)
CREATE OR REPLACE FUNCTION activate_property_with_credit(agent_uuid UUID, property_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    credit_consumed BOOLEAN;
BEGIN
    -- Intentar consumir crédito
    SELECT consume_publication(agent_uuid) INTO credit_consumed;
    
    IF NOT credit_consumed THEN
        RETURN FALSE;
    END IF;

    -- Activar propiedad
    UPDATE public.properties
    SET 
        status = 'active',
        published_at = NOW(),
        expires_at = NOW() + INTERVAL '90 days'
    WHERE id = property_uuid AND agent_id = agent_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Asegurar que usuarios existentes tengan entrada en agents
INSERT INTO agents (id, is_verified, publicaciones_disponibles, created_at, updated_at)
SELECT 
    up.id,
    CASE WHEN up.role = 'agent' THEN TRUE ELSE FALSE END,
    CASE WHEN up.role = 'agent' THEN 0 ELSE 0 END,
    NOW(),
    NOW()
FROM user_profiles up
WHERE up.id NOT IN (SELECT id FROM agents)
ON CONFLICT (id) DO NOTHING;

-- 8. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_agents_is_new_agent ON agents(is_new_agent);
CREATE INDEX IF NOT EXISTS idx_agents_is_verified ON agents(is_verified);
CREATE INDEX IF NOT EXISTS idx_payments_agent_id ON payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 9. Agregar columna para identificar publicaciones gratis en properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_free_publication BOOLEAN DEFAULT FALSE;
