# 数据模型设计文档

**项目：** MultiLanguageManager
**版本：** 1.0
**作者：** hunter
**日期：** 2026-02-27

---

## 概述

本文档定义 MultiLanguageManager 平台的数据库模型设计。基于 PRD 中的需求，采用固定字段设计（`text_cn`, `text_en`, `text_de` 等），预留扩展字段以支持未来功能。

---

## 数据库技术选型

**推荐数据库：** PostgreSQL 14+
- 支持 JSONB 字段（用于存储元数据）
- 全文搜索支持（PostgreSQL Full Text Search）
- UUID 原生支持
- 丰富的索引类型（B-tree, GIN, GiST）

**备选数据库：** MySQL 8.0+
- 更广泛的社区支持
- JSON 类型支持
- UUID 生成函数

---

## 数据模型设计

### 1. 用户表 (users)

**用途：** 存储平台用户信息

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('product_manager', 'developer', 'admin', 'support')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**字段说明：**
- `id`: 用户唯一标识（UUID）
- `username`: 用户名（唯一）
- `email`: 邮箱（唯一）
- `password_hash`: 密码哈希（使用 bcrypt 或 argon2）
- `role`: 用户角色（product_manager, developer, admin, support）
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `last_login_at`: 最后登录时间

---

### 2. 项目表 (projects)

**用途：** 存储项目基本信息

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supported_languages VARCHAR[12] NOT NULL DEFAULT ARRAY['CN', 'DA', 'DE', 'EN', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

**字段说明：**
- `id`: 项目唯一标识（UUID）
- `name`: 项目名称
- `description`: 项目描述
- `owner_id`: 项目所有者 ID（外键关联 users 表）
- `supported_languages`: 支持的语言数组（12种语言）
- `created_at`: 创建时间
- `updated_at`: 更新时间

---

### 3. 文案表 (translations)

**用途：** 存储多语言文案数据（固定字段设计）

```sql
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key_uuid VARCHAR(36) NOT NULL,
    context VARCHAR(255),

    -- 12种语言的固定字段
    text_cn TEXT,
    text_da TEXT,
    text_de TEXT,
    text_en TEXT,
    text_es TEXT,
    text_fi TEXT,
    text_fr TEXT,
    text_it TEXT,
    text_nl TEXT,
    text_no TEXT,
    text_pl TEXT,
    text_se TEXT,

    -- 扩展字段（预留）
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    CONSTRAINT uk_project_key UNIQUE (project_id, key_uuid)
);

CREATE INDEX idx_translations_project_id ON translations(project_id);
CREATE INDEX idx_translations_key_uuid ON translations(key_uuid);
CREATE INDEX idx_translations_context ON translations(context);
CREATE INDEX idx_translations_metadata ON translations USING GIN (metadata);
CREATE INDEX idx_translations_created_at ON translations(created_at DESC);
```

**字段说明：**
- `id`: 文案唯一标识（UUID）
- `project_id`: 项目 ID（外键关联 projects 表）
- `key_uuid`: 文案 key（UUID 格式字符串）
- `context`: 上下文信息（预留，用于未来扩展）
- `text_cn` 到 `text_se`: 12种语言的文案文本（固定字段）
- `metadata`: 元数据（JSONB 格式，预留扩展字段）
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `created_by`: 创建人 ID（外键关联 users 表）
- `updated_by`: 更新人 ID（外键关联 users 表）

**唯一约束：** `uk_project_key` 确保同一个项目中 key_uuid 唯一

---

### 4. API Key 表 (api_keys)

**用途：** 存储 API 访问凭证

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(8) NOT NULL,
    scopes VARCHAR[] NOT NULL DEFAULT ARRAY['read', 'write'],
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,
    ip_whitelist INET[] DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
```

**字段说明：**
- `id`: API Key 唯一标识（UUID）
- `user_id`: 用户 ID（外键关联 users 表）
- `project_id`: 项目 ID（外键关联 projects 表，可为 NULL 表示全局 API Key）
- `key_hash`: API Key 哈希（使用 SHA-256）
- `key_prefix`: API Key 前缀（8个字符，用于显示和日志记录）
- `scopes`: 权限范围数组（read, write）
- `rate_limit_per_minute`: 每分钟请求次数限制
- `ip_whitelist`: IP 白名单数组（可为 NULL 表示不限制）
- `is_active`: 是否激活
- `expires_at`: 过期时间（可为 NULL 表示永不过期）
- `last_used_at`: 最后使用时间
- `created_at`: 创建时间

---

### 5. 上传记录表 (upload_logs)

**用途：** 记录 Excel 文件上传历史

```sql
CREATE TABLE upload_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_rows INTEGER,
    new_rows INTEGER DEFAULT 0,
    updated_rows INTEGER DEFAULT 0,
    deleted_rows INTEGER DEFAULT 0,
    skipped_rows INTEGER DEFAULT 0,
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_upload_logs_project_id ON upload_logs(project_id);
CREATE INDEX idx_upload_logs_user_id ON upload_logs(user_id);
CREATE INDEX idx_upload_logs_status ON upload_logs(status);
CREATE INDEX idx_upload_logs_created_at ON upload_logs(created_at DESC);
```

**字段说明：**
- `id`: 上传记录唯一标识（UUID）
- `project_id`: 项目 ID（外键关联 projects 表）
- `user_id`: 用户 ID（外键关联 users 表）
- `filename`: 文件名
- `file_size`: 文件大小（字节）
- `status`: 状态（pending, processing, completed, failed）
- `total_rows`: 总行数
- `new_rows`: 新增行数
- `updated_rows`: 更新行数
- `deleted_rows`: 删除行数
- `skipped_rows`: 跳过行数
- `error_message`: 错误信息
- `processing_time_ms`: 处理时间（毫秒）
- `created_at`: 创建时间
- `completed_at`: 完成时间

---

### 6. 下载记录表 (download_logs)

**用途：** 记录 API 文件下载历史

```sql
CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    language VARCHAR(5) NOT NULL,
    total_records INTEGER NOT NULL,
    file_size INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    client_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_download_logs_project_id ON download_logs(project_id);
CREATE INDEX idx_download_logs_api_key_id ON download_logs(api_key_id);
CREATE INDEX idx_download_logs_platform ON download_logs(platform);
CREATE INDEX idx_download_logs_language ON download_logs(language);
CREATE INDEX idx_download_logs_created_at ON download_logs(created_at DESC);
```

**字段说明：**
- `id`: 下载记录唯一标识（UUID）
- `project_id`: 项目 ID（外键关联 projects 表）
- `api_key_id`: API Key ID（外键关联 api_keys 表）
- `platform`: 平台（ios, android, web）
- `language`: 语言代码
- `total_records`: 总记录数
- `file_size`: 文件大小（字节）
- `response_time_ms`: 响应时间（毫秒）
- `client_ip`: 客户端 IP
- `created_at`: 创建时间

---

### 7. 操作日志表 (audit_logs)

**用途：** 记录所有操作审计日志

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

**字段说明：**
- `id`: 审计日志唯一标识（UUID）
- `user_id`: 用户 ID（外键关联 users 表）
- `action`: 操作类型（create, update, delete, upload, download）
- `resource_type`: 资源类型（project, translation, api_key）
- `resource_id`: 资源 ID
- `details`: 详细信息（JSONB 格式）
- `ip_address`: IP 地址
- `user_agent`: User Agent
- `created_at`: 创建时间

---

### 8. 批量操作记录表 (batch_operations)

**用途：** 记录批量操作历史

```sql
CREATE TABLE batch_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('import', 'export', 'update', 'delete')),
    project_ids UUID[] NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_tasks INTEGER NOT NULL,
    completed_tasks INTEGER DEFAULT 0,
    failed_tasks INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_batch_operations_user_id ON batch_operations(user_id);
CREATE INDEX idx_batch_operations_operation_type ON batch_operations(operation_type);
CREATE INDEX idx_batch_operations_status ON batch_operations(status);
CREATE INDEX idx_batch_operations_started_at ON batch_operations(started_at DESC);
```

**字段说明：**
- `id`: 批量操作唯一标识（UUID）
- `user_id`: 用户 ID（外键关联 users 表）
- `operation_type`: 操作类型（import, export, update, delete）
- `project_ids`: 项目 ID 数组
- `status`: 状态（pending, processing, completed, failed, cancelled）
- `total_tasks`: 总任务数
- `completed_tasks`: 已完成任务数
- `failed_tasks`: 失败任务数
- `progress_percentage`: 进度百分比（0-100）
- `error_message`: 错误信息
- `started_at`: 开始时间
- `completed_at`: 完成时间

---

### 9. 文案变更历史表 (translation_history)

**用途：** 记录文案变更历史（Post-MVP 功能）

```sql
CREATE TABLE translation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id UUID NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- 变更前的值（JSONB 存储，灵活记录）
    old_values JSONB NOT NULL,

    -- 变更后的值（JSONB 存储，灵活记录）
    new_values JSONB NOT NULL,

    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_translation_history_translation_id ON translation_history(translation_id);
CREATE INDEX idx_translation_history_changed_by ON translation_history(changed_by);
CREATE INDEX idx_translation_history_change_type ON translation_history(change_type);
CREATE INDEX idx_translation_history_changed_at ON translation_history(changed_at DESC);
```

**字段说明：**
- `id`: 变更历史唯一标识（UUID）
- `translation_id`: 文案 ID（外键关联 translations 表）
- `changed_by`: 变更人 ID（外键关联 users 表）
- `old_values`: 变更前的值（JSONB 格式）
- `new_values`: 变更后的值（JSONB 格式）
- `change_type`: 变更类型（create, update, delete）
- `changed_at`: 变更时间

---

### 10. 系统配置表 (system_config)

**用途：** 存储系统级配置

```sql
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_config_key ON system_config(key);
```

**字段说明：**
- `key`: 配置键（唯一）
- `value`: 配置值
- `description`: 配置描述
- `updated_at`: 更新时间

**示例配置：**
```sql
INSERT INTO system_config (key, value, description) VALUES
('api.rate_limit_default', '100', '默认 API 每分钟请求次数限制'),
('api.max_file_size_mb', '50', '最大文件上传大小（MB）'),
('system.backup_enabled', 'true', '是否启用自动备份'),
('system.backup_time', '02:00', '自动备份时间');
```

---

## ER 图

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│  projects   │  │  api_keys   │
└──────┬──────┘  └──────┬──────┘
       │                │
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ translations│  │download_logs│
└──────┬──────┘  └─────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│translation_history│  │  upload_logs     │
└──────────────────┘  └──────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  audit_logs │  │batch_operations│ │system_config│
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 索引策略

### 主要索引
- 所有外键字段都创建了 B-tree 索引
- 常用查询字段（username, email, project_id）创建了索引
- 时间字段（created_at）创建了降序索引（用于分页查询）

### 特殊索引
- `translations.metadata`: 使用 GIN 索引（JSONB 字段查询）
- `api_keys.ip_whitelist`: 数组类型索引（PostgreSQL 原生支持）
- `batch_operations.project_ids`: 数组类型索引

---

## 数据迁移策略

### MVP 阶段
1. 创建所有基础表（users, projects, translations, api_keys）
2. 创建日志表（upload_logs, download_logs, audit_logs）
3. 创建系统配置表（system_config）

### Post-MVP 阶段
1. 添加文案变更历史表（translation_history）
2. 添加批量操作记录表（batch_operations）
3. 添加全文搜索索引（PostgreSQL Full Text Search）

---

## 备份和恢复

### 备份策略
- 每日全量备份（凌晨 2:00）
- 每小时增量备份
- 备份保留 30 天

### 备份命令（PostgreSQL）
```bash
# 全量备份
pg_dump -U postgres -d multilanguage_manager > backup_$(date +%Y%m%d).sql

# 压缩备份
pg_dump -U postgres -d multilanguage_manager | gzip > backup_$(date +%Y%m%d).sql.gz

# 仅备份表结构
pg_dump -U postgres -d multilanguage_manager --schema-only > schema.sql

# 仅备份数据
pg_dump -U postgres -d multilanguage_manager --data-only > data.sql
```

### 恢复命令（PostgreSQL）
```bash
# 恢复备份
psql -U postgres -d multilanguage_manager < backup_20260227.sql

# 恢复压缩备份
gunzip -c backup_20260227.sql.gz | psql -U postgres -d multilanguage_manager
```

---

## 性能优化建议

### 查询优化
1. 使用 `EXPLAIN ANALYZE` 分析慢查询
2. 为常用查询条件添加复合索引
3. 使用 `VACUUM` 和 `ANALYZE` 定期优化表

### 连接池
- 使用连接池（如 PgBouncer）
- 最大连接数：20-50（根据服务器配置调整）

### 缓存
- 使用 Redis 缓存频繁访问的数据
- 缓存项目列表、用户权限等数据
- 设置合理的过期时间（如 5-10 分钟）

---

## 安全性

### 密码安全
- 使用 bcrypt 或 argon2 哈希密码
- 盐值随机生成（bcrypt/argon2 内置）

### API Key 安全
- 使用 SHA-256 哈希存储 API Key
- 只存储前 8 个字符（key_prefix）用于显示
- 完整的 API Key 仅在创建时显示一次

### 敏感数据保护
- 启用数据库连接加密（SSL/TLS）
- 定期轮换 API Key
- 实施最小权限原则

---

## 版本控制

### 数据库迁移工具
推荐使用数据库迁移工具：
- **PostgreSQL:** Flyway, Liquibase, pg_migrate
- **通用:** Prisma Migrate, Knex.js

### 迁移脚本命名规范
```
V1__create_users_table.sql
V2__create_projects_table.sql
V3__create_translations_table.sql
...
```

---

## 附录：语言代码映射表

| 语言代码 | 语言名称 |
|---------|---------|
| CN      | 中文     |
| DA      | 丹麦语   |
| DE      | 德语     |
| EN      | 英语     |
| ES      | 西班牙语 |
| FI      | 芬兰语   |
| FR      | 法语     |
| IT      | 意大利语 |
| NL      | 荷兰语   |
| NO      | 挪威语   |
| PL      | 波兰语   |
| SE      | 瑞典语   |
