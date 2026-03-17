-- MultiLanguageManager - Supabase Database Schema
-- This script creates all necessary tables for the MultiLanguageManager application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
  languages TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  cn TEXT,
  en TEXT,
  de TEXT,
  es TEXT,
  fi TEXT,
  fr TEXT,
  it TEXT,
  nl TEXT,
  no TEXT,
  pl TEXT,
  se TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'TRANSLATED', 'REVIEWED', 'ERROR')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for entries
CREATE INDEX IF NOT EXISTS idx_entries_project_id ON entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_key ON entries(key);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

-- ============================================
-- API_KEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  prefix TEXT NOT NULL,
  suffix TEXT NOT NULL,
  last_used TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- ============================================
-- EXPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for exports
CREATE INDEX IF NOT EXISTS idx_exports_project_id ON exports(project_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created_by ON exports(created_by);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- RLS Policies for projects
CREATE POLICY "Users can view all projects" -- Adjust as needed
  ON projects FOR SELECT
  USING (true);

-- RLS Policies for entries
CREATE POLICY "Users can view all entries" -- Adjust as needed
  ON entries FOR SELECT
  USING (true);

-- RLS Policies for api_keys
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies for exports
CREATE POLICY "Users can view their own exports"
  ON exports FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own exports"
  ON exports FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT TEST DATA
-- ============================================

-- Note: In production, you should remove this section and use proper seeding

-- Insert test user (password: password123)
-- Password hash is bcrypt hash of 'password123' with salt rounds 10
INSERT INTO users (id, email, password, name, active)
VALUES (
  'd00c3096-760c-4ea6-ab23-5b70eb9cabd5',
  'admin@example.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
  'Test Admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert test projects
INSERT INTO projects (name, description, status, languages)
VALUES
  ('E-commerce App', 'Main application translations', 'ACTIVE', ARRAY['EN', 'DE', 'ES', 'FR', 'IT']),
  ('Marketing Website', 'Website content translations', 'ACTIVE', ARRAY['EN', 'DE', 'FR', 'NL'])
ON CONFLICT DO NOTHING;

-- Insert test entries (for the first project)
INSERT INTO entries (project_id, key, en, de, es, status)
SELECT
  p.id,
  e.key,
  e.en,
  e.de,
  e.es,
  e.status
FROM (SELECT id FROM projects WHERE name = 'E-commerce App' LIMIT 1) p
CROSS JOIN (VALUES
  ('welcome_title', 'Welcome', 'Willkommen', 'Bienvenido', 'NEW'),
  ('login_button', 'Login', 'Anmelden', 'Iniciar sesión', 'NEW'),
  ('logout_button', 'Logout', 'Abmelden', 'Cerrar sesión', 'NEW'),
  ('success_message', 'Operation successful', 'Vorgang erfolgreich', 'Operación exitosa', 'NEW')
) AS e(key, en, de, es, status)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MultiLanguageManager database schema created successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - users';
    RAISE NOTICE '  - projects';
    RAISE NOTICE '  - entries';
    RAISE NOTICE '  - api_keys';
    RAISE NOTICE '  - exports';
    RAISE NOTICE '';
    RAISE NOTICE 'Test credentials:';
    RAISE NOTICE '  Email: admin@example.com';
    RAISE NOTICE '  Password: password123';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE '========================================';
END $$;
