-- ============================================
-- MultiLanguageManager 数据库表创建脚本
-- PostgreSQL/Supabase 版本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (NOW()),
  updatedAt TEXT NOT NULL DEFAULT (NOW())
);

-- 2. 创建 projects 表
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
  languages TEXT,
  createdAt TEXT NOT NULL DEFAULT (NOW()),
  updatedAt TEXT NOT NULL DEFAULT (NOW())
);

-- 3. 创建 entries 表
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  projectId TEXT NOT NULL,
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
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'MODIFIED', 'TRANSLATED', 'REVIEWED')),
  error TEXT,
  createdAt TEXT NOT NULL DEFAULT (NOW()),
  updatedAt TEXT NOT NULL DEFAULT (NOW()),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. 创建 api_keys 表
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  name TEXT NOT NULL,
  keyHash TEXT NOT NULL,
  prefix TEXT NOT NULL,
  suffix TEXT NOT NULL,
  lastUsed TEXT,
  usageCount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
  expiresAt TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (NOW()),
  revokedAt TEXT,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- 5. 创建 exports 表
CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  projectId TEXT NOT NULL,
  platforms TEXT,
  languages TEXT,
  url TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  errorMessage TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (NOW()),
  completedAt TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- ============================================
-- 插入测试数据
-- ============================================

-- 插入测试用户 (password: admin123)
-- bcrypt hash for 'admin123': $2a$10$e39gDUlwmLh/ArUzrihgMuGgVucuVsLchka1oVoCk8kG5DJ3LrfWG
INSERT INTO users (id, email, password, name, active, createdAt, updatedAt)
VALUES (
  'd20c3096-760c-4ea6-ab42-5b70eb9cabd5',
  'admin@example.com',
  '$2a$10$e39gDUlwmLh/ArUzrihgMuGgVucuVsLchka1oVoCk8kG5DJ3LrfWG',
  'Test Admin',
  1,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  active = EXCLUDED.active,
  updatedAt = NOW();

-- 插入测试项目
INSERT INTO projects (id, name, description, status, languages, createdAt, updatedAt)
VALUES
  (
    '45bd01fd-aa2d-40b1-ab23-5785375ac588',
    'Marketing Website',
    'Website content translations',
    'ACTIVE',
    '["EN","DE","FR","NL"]',
    NOW(),
    NOW()
  ),
  (
    '7c1d9dd9-a751-4ed8-8f4f-2d2e1bf378c6',
    'E-commerce App',
    'Main application translations',
    'ACTIVE',
    '["EN","DE","ES","FR","IT"]',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  languages = EXCLUDED.languages,
  updatedAt = NOW();

-- 插入测试条目
INSERT INTO entries (id, projectId, key, en, de, es, cn, status, createdAt, updatedAt)
VALUES
  (
    '251fdd61-44d6-427a-a901-09337c53acfd',
    '45bd01fd-aa2d-40b1-ab23-5785375ac588',
    'login_button',
    'Login',
    'Anmelden',
    'Iniciar sesión',
    '登录',
    'NEW',
    NOW(),
    NOW()
  ),
  (
    '166da3db-efb0-4465-a0ff-6972c2c2749b',
    '45bd01fd-aa2d-40b1-ab23-5785375ac588',
    'welcome_title',
    'Welcome',
    'Willkommen',
    'Bienvenido',
    '欢迎',
    'NEW',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  projectId = EXCLUDED.projectId,
  key = EXCLUDED.key,
  en = EXCLUDED.en,
  de = EXCLUDED.de,
  es = EXCLUDED.es,
  cn = EXCLUDED.cn,
  status = EXCLUDED.status,
  updatedAt = NOW();

-- ============================================
-- 启用 RLS (行级安全) - 可选但推荐
-- ============================================

-- 注意：暂时禁用RLS以允许service_role完全访问
-- 后续可以根据需要添加更细粒度的权限控制

-- ============================================
-- 完成提示
-- ============================================

-- 验证表创建
SELECT '✅ Users table created' AS status;
SELECT '✅ Projects table created' AS status;
SELECT '✅ Entries table created' AS status;
SELECT '✅ API Keys table created' AS status;
SELECT '✅ Exports table created' AS status;

-- 验证数据插入
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS project_count FROM projects;
SELECT COUNT(*) AS entry_count FROM entries;

SELECT '============================================' AS status;
SELECT '✅ 数据库初始化完成！' AS status;
SELECT '============================================' AS status;
