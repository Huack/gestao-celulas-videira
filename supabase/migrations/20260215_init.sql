-- =============================================
-- Gestão de Células — Schema Inicial (Dev)
-- Sem auth (acesso rápido, sem senha)
-- =============================================

-- Perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    phone TEXT,
    profile TEXT DEFAULT 'visitante',
    is_first_access BOOLEAN DEFAULT true,
    onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Células / grupos
CREATE TABLE IF NOT EXISTS cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    leader TEXT,
    district TEXT,
    address TEXT,
    day_of_week TEXT,
    time TEXT,
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vínculo visitante ↔ célula
CREATE TABLE IF NOT EXISTS visitor_cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cell_id UUID REFERENCES cells(id) ON DELETE CASCADE,
    cell_name TEXT,
    cell_leader TEXT,
    cell_tags JSONB DEFAULT '[]',
    skipped_choice BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Preferências genéricas (versão da bíblia, tema, etc)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, key)
);

-- =============================================
-- DEV MODE: Sem RLS (acesso livre para testes)
-- Em produção, ativar RLS com policies por user
-- =============================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cells DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_cells DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Dados de exemplo
INSERT INTO cells (name, leader, district, day_of_week, time, tags) VALUES
    ('Célula Graça', 'João Silva', 'Centro', 'Quarta', '19:30', '["Jovens", "Centro"]'),
    ('Célula Esperança', 'Maria Santos', 'Zona Sul', 'Quinta', '20:00', '["Casais", "Zona Sul"]'),
    ('Célula Vitória', 'Pedro Oliveira', 'Zona Norte', 'Terça', '19:00', '["Família", "Zona Norte"]');
