# Supabase 数据库迁移指南

本指南将帮助您将 MultiLanguageManager 应用从 SQLite 迁移到 Supabase。

## 📋 目录

1. [前置要求](#前置要求)
2. [获取 Supabase 凭据](#获取-supabase-凭据)
3. [创建 Supabase 项目](#创建-supabase-项目)
4. [配置环境变量](#配置环境变量)
5. [创建数据库表结构](#创建数据库表结构)
6. [测试数据库连接](#测试数据库连接)
7. [故障排除](#故障排除)

---

## 前置要求

- Node.js 18+ 已安装
- 已有 Supabase 账号（免费计划即可）
- Git 访问权限（用于保存代码更改）

---

## 获取 Supabase 凭据

### 1. 创建 Supabase 账号

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击 "Start your project"
3. 使用以下方式之一注册：
   - GitHub 账号（推荐）
   - Google 账号
   - 电子邮件注册

### 2. 创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Name**: `multilanguage-manager`（或您喜欢的名称）
   - **Database Password**: 设置一个强密码（至少 10 个字符）
   - **Region**: 选择离您最近的区域
3. 点击 "Create new project"

### 3. 获取 API 凭据

创建项目后，您将看到项目仪表板。按照以下步骤获取所需的凭据：

#### 3.1. 进入项目设置

1. 在左侧导航栏中，点击 **Settings**（齿轮图标）
2. 选择 **API** 标签页

#### 3.2. 复制必需的凭据

在 API 页面中，您会看到三个凭据。请复制以下三个：

1. **Project URL**
   - 格式：`https://xxxxxxxxxxxx.supabase.co`
   - 示例：`https://abc123xyz.supabase.co`

2. **anon public**
   - 格式：以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头
   - 用于客户端访问
   - ⚠️ 这是公开密钥，可以在前端代码中使用

3. **service_role**（secret）
   - 格式：以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头
   - 用于服务端访问
   - ⚠️ **这是私有密钥，绝不要在前端代码中使用！**

### 4. 验证数据库连接字符串（可选）

如果您需要直接使用 SQL 客户端或 PostgreSQL 客户端，可以获取数据库连接字符串：

1. 在 **Settings** 中，点击 **Database** 标签页
2. 在 "Connection string" 部分，复制连接字符串
   - 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - 注意：本应用使用 Supabase SDK，通常不需要此连接字符串

---

## 创建 Supabase 项目

如果还没有创建项目，请按照以下步骤创建：

### 步骤 1: 创建项目

1. 登录 Supabase Dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `multilanguage-manager`
   - Database Password: `your-secure-password-here`（至少 10 个字符）
   - Region: 选择离您最近的区域

### 步骤 2: 等待数据库初始化

创建项目后，Supabase 会自动创建一个 PostgreSQL 数据库。这可能需要几秒钟到几分钟。

### 步骤 3: 下载 SQL 脚本

我已经为您准备好了完整的 SQL 脚本：

**文件位置**: `backend/supabase/schema.sql`

该脚本包含：

- ✅ 创建所有必需的表（users, projects, entries, api_keys, exports）
- ✅ 设置正确的数据类型和约束
- ✅ 创建索引以提高查询性能
- ✅ 启用行级安全（RLS）
- ✅ 插入测试数据（用户、项目、条目）

---

## 配置环境变量

### 步骤 1: 创建环境变量文件

1. 复制环境变量模板文件：

   ```bash
   cp backend/.env.supabase.example backend/.env
   ```

2. 编辑 `backend/.env` 文件，填入您的 Supabase 凭据：

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Supabase Anon Key (public - for client-side use)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb3VsZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTk2MDAwMDAwMDl9.YOUR_ANON_KEY_HERE

# Supabase Service Role Key (private - for server-side use only)
# WARNING: Never commit this key to version control or use it in client-side code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb3VsZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTYwMDAwMDAwMH0.YOUR_SERVICE_ROLE_KEY_HERE

# JWT Secret (for token verification)
JWT_SECRET=your-jwt-secret-key-min-32-chars-long

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 步骤 2: 验证凭据

请确保：

- `SUPABASE_URL` 完整且正确
- `SUPABASE_ANON_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY` 已填写
- `JWT_SECRET` 是至少 32 个字符的安全随机字符串
- `FRONTEND_URL` 与您的开发服务器端口匹配

### 步骤 3: 提交到版本控制

⚠️ **重要安全提示**：

- **不要**将 `.env` 文件提交到 Git
- **不要**将 `SUPABASE_SERVICE_ROLE_KEY` 分享给任何人
- `.env` 文件已经在 `.gitignore` 中，所以不会被提交

---

## 创建数据库表结构

### 方法 1: 使用 Supabase SQL 编辑器（推荐）

1. 在 Supabase Dashboard 中，点击 **SQL Editor**（SQL 图标）
2. 点击 **New Query**
3. 复制 `backend/supabase/schema.sql` 文件的内容
4. 粘贴到 SQL 编辑器中
5. 点击 **Run** 按钮执行脚本

6. 等待执行完成（通常需要 1-2 秒）

您应该看到类似这样的输出：

```
NOTICE:  ========================================
NOTICE:  MultiLanguageManager database schema created successfully!
NOTICE:  ========================================
NOTICE: Tables created:
NOTICE:   - users
NOTICE:   - projects
NOTICE:   - entries
NOTICE:   - api_keys
NOTICE:   - exports
NOTICE:
NOTICE: Test credentials:
NOTICE:   Email: admin@example.com
NOTICE:   Password: password123
NOTICE:
NOTICE: RLS enabled on all tables
NOTICE: ========================================
```

### 方法 2: 使用 Supabase CLI

如果您安装了 Supabase CLI：

```bash
# 登录 Supabase
npx supabase login

# 链接到项目
npx supabase link --project-ref YOUR_PROJECT_REF

# 运行 SQL 脚本
npx supabase db execute --file backend/supabase/schema.sql
```

### 验证表创建

在 Supabase Dashboard 中，点击 **Table Editor**，您应该看到以下表：

- ✅ `users` - 用户表
- ✅ `projects` - 项目表
- ✅ `entries` - 条目表
- ✅ `api_keys` - API 密钥表
  ✅ `exports` - 导出记录表

---

## 测试数据库连接

### 步骤 1: 启动开发服务器

在 `backend` 目录中运行：

```bash
cd backend
npm run dev
```

如果一切配置正确，您应该看到：

```
[INFO] ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.9.3)
🚀 Server is running!
   Port: 3001
   Environment: development
   API: http://localhost:3001/api/v1

🧪 Test endpoints:
   - GET  http://localhost:3001/api/v1/health
   - POST http://localhost:3001/api/v1/auth/login
   - GET  http://localhost:3001/api/v1/projects
   - DELETE http://localhost:3001/api/v1/projects/:projectId/entries/:id
   - DELETE http://localhost:3001/api/v1/projects/:id
   - POST http://localhost:3001/api/v1/projects

🔐 Test credentials:
   Email: admin@example.com
   Password: password123
```

### 步骤 2: 测试 API 端点

使用 curl 或 Postman 测试 API：

#### 2.1. 健康检查

```bash
curl http://localhost:3001/api/v1/health
```

预期响应：

```json
{
  "status": "running",
  "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ",
  "database": "connected"
}
```

#### 2.2. 用户登录

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

预期响应：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "d00c3096-760c-4ea6-ab23-5b70eb9cabd5",
      "email": "admin@example.com",
      "name": "Test Admin"
    }
  }
  }
}
```

#### 2.3. 获取项目列表

```bash
curl http://localhost:3001/api/v1/projects
```

预期响应：

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "...",
        "name": "E-commerce App",
        "description": "Main application translations",
        "status": "ACTIVE",
        "languages": ["EN", "DE", "ES", "FR", "IT"],
        "createdAt": "2024-xx-xxT...",
        "updatedAt": "2024-xx-xxT..."
      }
    ],
    "total": 2,
    "pages": 1,
    "currentPage": 1
  }
}
```

---

## 故障排除

### 问题 1: 环境变量未加载

**错误信息**：

```
⚠️  Supabase credentials not found in environment variables
```

**解决方案**：

1. 确保 `backend/.env` 文件存在
2. 检查文件中是否包含所有必需的环境变量
3. 确保没有拼写错误（例如 `SUPABASE_URL` vs `SUPABASE_URL`）

### 问题 2: 数据库连接失败

**错误信息**：

```
❌ Database error: Invalid API Key
```

**解决方案**：

1. 验证 `SUPABASE_URL` 是否正确
2. 验证 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
3. 确保您的 Supabase 项目没有暂停或删除

### 问题 3: 表不存在

**错误信息**：

```
❌ Database error (PGRST116): Not found
```

**解决方案**：

1. 确保已在 Supabase Dashboard 中运行了 `schema.sql` 脚本
2. 检查表名是否正确（小写：`users`, `projects`, `entries`, `api_keys`, `exports`）
3. 在 Supabase Dashboard 的 Table Editor 中查看表是否已创建

### 问题 4: RLS 策略阻止查询

**错误信息**：

```
❌ Database error: Permission denied
```

**解决方案**：

1. 检查 Supabase Dashboard → Authentication → Policies
2. 确保 RLS 策略已正确设置
3. 对于开发环境，可以考虑暂时禁用 RLS（不推荐生产环境）

### 问题 5: 前端无法连接

**错误信息**：

```
❌ CORS Error: Origin not allowed
```

**解决方案**：

1. 确保 `.env` 文件中的 `FRONTEND_URL` 与前端开发服务器端口匹配
2. 检查 Supabase 项目设置 → Authentication → URL Configuration
3. 添加前端 URL 到 Allowed URLs 列表

---

## 下一步

迁移完成后，您可以：

1. ✅ 使用 Supabase Dashboard 查看和管理数据
2. ✅ 使用 Supabase Studio 执行 SQL 查询
3. ✅ 启用实时功能（实时订阅）
4. ✅ 配置数据库备份和恢复

---

## 技术支持

如果在迁移过程中遇到问题：

1. 查看 [Supabase 文档](https://supabase.com/docs)
2. 查看 [Supabase JavaScript 客户端文档](https://supabase.com/docs/reference/javascript)
3. 在 GitHub 上创建 issue

---

## 安全建议

1. ⚠️ **永远不要**在前端代码中使用 `SUPABASE_SERVICE_ROLE_KEY`
2. ⚠️ **永远不要**将 `.env` 文件提交到版本控制
3. ✅ 定期更新您的 Supabase 项目密钥
4. ✅ 启用 Two-Factor Authentication (2FA) 保护您的 Supabase 账号
5. ✅ 定期审查 RLS 策略，确保适当的数据访问控制

---

## 总结

完成本指南后，您的 MultiLanguageManager 应用将：

- ✅ 使用 Supabase PostgreSQL 数据库
- ✅ 支持自动备份和恢复
- ✅ 支持实时订阅和实时功能
- ✅ 提供更好的可扩展性
- ✅ 集中式数据库管理

祝您迁移顺利！🎉
