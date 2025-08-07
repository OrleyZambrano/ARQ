-- =====================================================
-- SISTEMA DE PUBLICACIONES GRATIS Y PAGOS CON PAYPAL
-- =====================================================

-- 1. Agregar campos para publicaciones gratis a la tabla agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS free_publications_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new_agent BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS publicaciones_disponibles INTEGER DEFAULT 10;

-- 2. Agregar campo para identificar publicaciones gratis en properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_free_publication BOOLEAN DEFAULT FALSE;

-- 3. Crear tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'premium', 'enterprise')),
    amount DECIMAL(10,2) NOT NULL,
    credits_awarded INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('paypal', 'stripe')),
    transaction_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paypal_details JSONB, -- Detalles adicionales de PayPal
    stripe_details JSONB, -- Detalles adicionales de Stripe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS en payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para payments
DROP POLICY IF EXISTS "Agents can view own payments" ON payments;
CREATE POLICY "Agents can view own payments" ON payments
    FOR SELECT USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Agents can insert own payments" ON payments;
CREATE POLICY "Agents can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- 6. Función para verificar si puede usar publicación gratis
CREATE OR REPLACE FUNCTION can_use_free_publication(agent_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    agent_record RECORD;
BEGIN
    -- Obtener datos del agente
    SELECT 
        a.free_publications_used,
        a.is_new_agent,
        up.role,
        a.created_at
    INTO agent_record
    FROM agents a
    JOIN user_profiles up ON up.id = a.id
    WHERE a.id = agent_uuid;

    -- Verificar si existe el registro
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Puede usar gratis si:
    -- 1. Es agente
    -- 2. Es nuevo agente
    -- 3. No ha usado las 2 publicaciones gratis
    -- 4. Se registró hace menos de 30 días (opcional)
    RETURN agent_record.role = 'agent'
           AND agent_record.is_new_agent
           AND agent_record.free_publications_used < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función para usar publicación gratis
CREATE OR REPLACE FUNCTION use_free_publication(agent_uuid UUID, property_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    can_use BOOLEAN;
BEGIN
    -- Verificar si puede usar publicación gratis
    SELECT can_use_free_publication(agent_uuid) INTO can_use;
    
    IF NOT can_use THEN
        RETURN FALSE;
    END IF;

    -- Marcar propiedad como publicación gratis y activarla
    UPDATE properties
    SET 
        is_free_publication = TRUE,
        status = 'active',
        published_at = NOW(),
        expires_at = NOW() + INTERVAL '60 days',
        updated_at = NOW()
    WHERE id = property_uuid AND agent_id = agent_uuid;

    -- Verificar que la propiedad se actualizó
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Incrementar contador de publicaciones gratis usadas
    UPDATE agents
    SET 
        free_publications_used = free_publications_used + 1,
        updated_at = NOW()
    WHERE id = agent_uuid;

    -- Si ya usó las 2 publicaciones gratis, ya no es agente nuevo
    UPDATE agents
    SET 
        is_new_agent = FALSE,
        updated_at = NOW()
    WHERE id = agent_uuid AND free_publications_used >= 2;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Función para procesar pago y otorgar créditos
CREATE OR REPLACE FUNCTION process_payment_and_grant_credits(
    agent_uuid UUID,
    plan_name TEXT,
    credits_amount INTEGER,
    payment_amount DECIMAL,
    transaction_id TEXT,
    payment_method TEXT,
    payment_details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Insertar registro de pago
    INSERT INTO payments (
        agent_id,
        plan,
        amount,
        credits_awarded,
        payment_method,
        transaction_id,
        status,
        paypal_details,
        stripe_details
    ) VALUES (
        agent_uuid,
        plan_name,
        payment_amount,
        credits_amount,
        payment_method,
        transaction_id,
        'completed',
        CASE WHEN payment_method = 'paypal' THEN payment_details ELSE NULL END,
        CASE WHEN payment_method = 'stripe' THEN payment_details ELSE NULL END
    );

    -- Actualizar créditos del agente
    UPDATE agents
    SET 
        publicaciones_disponibles = COALESCE(publicaciones_disponibles, 0) + credits_amount,
        updated_at = NOW()
    WHERE id = agent_uuid;

    -- Verificar que se actualizó
    IF NOT FOUND THEN
        -- Si no existe el registro de agente, crearlo
        INSERT INTO agents (id, publicaciones_disponibles, created_at, updated_at)
        VALUES (agent_uuid, credits_amount, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            publicaciones_disponibles = COALESCE(agents.publicaciones_disponibles, 0) + credits_amount,
            updated_at = NOW();
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Función para obtener estado del agente (créditos y publicaciones gratis)
CREATE OR REPLACE FUNCTION get_agent_status(agent_uuid UUID)
RETURNS TABLE (
    credits INTEGER,
    free_publications_used INTEGER,
    can_use_free BOOLEAN,
    is_new_agent BOOLEAN,
    total_payments DECIMAL,
    total_properties INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(a.publicaciones_disponibles, 0) as credits,
        COALESCE(a.free_publications_used, 0) as free_publications_used,
        can_use_free_publication(agent_uuid) as can_use_free,
        COALESCE(a.is_new_agent, TRUE) as is_new_agent,
        COALESCE(SUM(p.amount), 0::DECIMAL) as total_payments,
        COALESCE(COUNT(pr.id), 0)::INTEGER as total_properties
    FROM agents a
    LEFT JOIN payments p ON p.agent_id = a.id AND p.status = 'completed'
    LEFT JOIN properties pr ON pr.agent_id = a.id
    WHERE a.id = agent_uuid
    GROUP BY a.id, a.publicaciones_disponibles, a.free_publications_used, a.is_new_agent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las tablas relevantes
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Insertar datos de agentes existentes
INSERT INTO agents (id, publicaciones_disponibles, free_publications_used, is_new_agent, created_at, updated_at)
SELECT 
    up.id,
    10 as publicaciones_disponibles,
    0 as free_publications_used,
    TRUE as is_new_agent,
    up.created_at,
    NOW() as updated_at
FROM user_profiles up
WHERE up.role = 'agent'
AND NOT EXISTS (SELECT 1 FROM agents WHERE agents.id = up.id)
ON CONFLICT (id) DO NOTHING;

-- 12. Vista para dashboard de agentes con información completa
CREATE OR REPLACE VIEW agent_dashboard_view AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.phone,
    COALESCE(a.publicaciones_disponibles, 0) as credits,
    COALESCE(a.free_publications_used, 0) as free_publications_used,
    COALESCE(a.is_new_agent, TRUE) as is_new_agent,
    can_use_free_publication(up.id) as can_use_free,
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_properties,
    COUNT(DISTINCT CASE WHEN p.is_free_publication = TRUE THEN p.id END) as free_properties_used,
    COALESCE(SUM(pay.amount), 0) as total_spent,
    COUNT(DISTINCT pay.id) as total_payments,
    up.created_at as joined_at,
    a.updated_at as last_updated
FROM user_profiles up
LEFT JOIN agents a ON a.id = up.id
LEFT JOIN properties p ON p.agent_id = up.id
LEFT JOIN payments pay ON pay.agent_id = up.id AND pay.status = 'completed'
WHERE up.role = 'agent'
GROUP BY up.id, up.email, up.full_name, up.phone, a.publicaciones_disponibles, 
         a.free_publications_used, a.is_new_agent, up.created_at, a.updated_at;

-- 13. Función para obtener historial de pagos de un agente
CREATE OR REPLACE FUNCTION get_payment_history(agent_uuid UUID)
RETURNS TABLE (
    payment_id UUID,
    plan TEXT,
    amount DECIMAL,
    credits_awarded INTEGER,
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as payment_id,
        p.plan,
        p.amount,
        p.credits_awarded,
        p.payment_method,
        p.transaction_id,
        p.status,
        p.created_at
    FROM payments p
    WHERE p.agent_id = agent_uuid
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_agent_id ON payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_is_new_agent ON agents(is_new_agent);
CREATE INDEX IF NOT EXISTS idx_properties_is_free_publication ON properties(is_free_publication);

-- 15. Datos de prueba para los planes (opcional)
CREATE TABLE IF NOT EXISTS payment_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    credits INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar planes definidos
INSERT INTO payment_plans (id, name, price, credits, duration_days, features) VALUES
('starter', 'Starter', 10.00, 5, 90, '["5 propiedades", "90 días de duración c/u", "Analytics básicos", "Chat con compradores"]'::jsonb),
('professional', 'Professional', 18.00, 10, 90, '["10 propiedades", "90 días de duración c/u", "Analytics avanzados", "Chat prioritario", "Soporte por email"]'::jsonb),
('premium', 'Premium', 30.00, 20, 120, '["20 propiedades", "120 días de duración c/u", "Analytics completos", "Chat prioritario", "Soporte telefónico", "Destacar propiedades"]'::jsonb),
('enterprise', 'Enterprise', 50.00, 50, 120, '["50 propiedades", "120 días de duración c/u", "Analytics premium", "Gerente de cuenta", "API personalizada", "Branding personalizado"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    credits = EXCLUDED.credits,
    duration_days = EXCLUDED.duration_days,
    features = EXCLUDED.features,
    active = EXCLUDED.active;

-- 16. Verificación final
SELECT 'VERIFICACIÓN FINAL - SISTEMA DE PAGOS CONFIGURADO:' as status;

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'payment_plans', 'agents', 'properties');

-- Verificar funciones creadas
SELECT 'Funciones creadas:' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('can_use_free_publication', 'use_free_publication', 'process_payment_and_grant_credits', 'get_agent_status');

-- Verificar políticas RLS
SELECT 'Políticas RLS creadas:' as info;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('payments', 'agents');

SELECT '🎉 SISTEMA DE PAGOS PAYPAL Y PUBLICACIONES GRATIS CONFIGURADO EXITOSAMENTE' as resultado;
