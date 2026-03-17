# 创建Supabase项目指南

## 步骤1：创建Supabase账号

1. 访问：https://supabase.com
2. 点击 "Start your project"
3. 使用GitHub或Email注册

## 步骤2：创建新项目

1. 登录后点击 "New Project"
2. 填写项目信息：
   - **Name:** `MultiLanguageManager`
   - **Database Password:** 生成强密码并保存
   - **Region:** 选择最近的区域（如：Southeast Asia (Singapore)）
   - **Pricing Plan:** 选择 "Free" (免费计划)

3. 等待项目创建（通常需要1-2分钟）

## 步骤3：获取项目凭证

项目创建完成后，找到以下信息：

### 1. Project URL

- 在项目Dashboard点击 "Settings" → "API"
- 找到 **Project URL**，格式如：`https://xxxxxxxxxxxx.supabase.co`

### 2. Anon Key

- 在同一页面找到 **anon** key
- 这是一个公开的API密钥

### 3. Service Role Key

- 找到 **service_role** key
- ⚠️ **这是私有密钥，仅用于服务器端**
- ⚠️ **不要提交到版本控制**

## 步骤4：更新.env文件

在 `backend/.env` 中更新以下配置：

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co  # 替换为你的Project URL
SUPABASE_ANON_KEY=eyJhbGci...              # 替换为你的anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...       # 替换为你的service_role key
```

## 步骤5：创建数据库表

### 方法1：使用Supabase SQL Editor

1. 在Supabase Dashboard点击 "SQL Editor"
2. 点击 "New query"
3. 复制以下SQL脚本并执行：

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE',
  languages TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
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
  status TEXT DEFAULT 'NEW',
  error TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  keyHash TEXT NOT NULL,
  prefix TEXT NOT NULL,
  suffix TEXT NOT NULL,
  lastUsed TEXT,
  usageCount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  expiresAt TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  revokedAt TEXT,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Create exports table
CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  platforms TEXT,
  languages TEXT,
  url TEXT,
  status TEXT DEFAULT 'PENDING',
  errorMessage TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  completedAt TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Insert test user (password: admin123)
INSERT INTO users (id, email, password, name, active, createdAt, updatedAt)
VALUES (
  'd20c3096-760c-4ea6-ab42-5b70eb9cabd5',
  'admin@example.com',
  '$2a$10$e39gDUlwmLh/ArUzrihgMuGgVucuVsLchka1oVoCk8kG5DJ3LrfWG',
  'Test Admin',
  1,
  datetime('now'),
  datetime('now')
);
```

### 方法2：使用Supabase迁移文件（推荐）

1. 在项目根目录创建 `supabase/migrations` 目录
2. 创建SQL迁移文件
3. 使用 Supabase CLI 运行迁移

参考文档：https://supabase.com/docs/guides/cli/local-development

## 步骤6：配置RLS策略（可选但推荐）

启用行级安全策略（Row Level Security）：

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- 允许service_role完全访问（用于后端）
CREATE POLICY "Service role has full access"
ON users FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role has full access"
ON projects FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role has full access"
ON entries FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role has full access"
ON api_keys FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role has full access"
ON exports FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

## 步骤7：重启后端服务器

```bash
cd backend
npm run dev
```

## 步骤8：测试连接

```bash
# 测试健康检查
curl http://localhost:3001/api/v1/health

# 测试登录
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 常见问题

### Q: 需要付费吗？

A: 不需要，Supabase的免费计划足够小型项目使用。

### Q: 如何保护数据库安全？

A:

1. 使用JWT认证保护所有API端点
2. 启用RLS策略
3. 不要在前端代码中使用service_role key
4. 定期轮换API密钥

### Q: 数据可以备份吗？

A: 是的，Supabase提供自动备份功能，免费计划包含7天备份。

### Q: 如何查看数据库？

A:

1. Supabase Dashboard → Table Editor（可视化）
2. SQL Editor（执行SQL查询）

---

**下一步：** 按照上述步骤创建Supabase项目并更新配置，然后重启后端服务器测试。
