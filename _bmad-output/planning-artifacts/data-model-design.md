# 数据模型设计文档

**项目：** MultiLanguageManager
**版本：** 1.0
**日期：** 2026-02-27
**作者：** 基于PRD v1.0

---

## 1. 概述

MultiLanguageManager 的数据模型设计基于以下原则：
- **简单性：** MVP 阶段使用固定字段设计，避免过度抽象
- **性能：** 支持高效查询和批量操作
- **扩展性：** 预留扩展字段以支持未来功能
- **数据一致性：** 使用事务确保多项目批量操作的一致性

---

## 2. 核心实体定义

### 2.1 Project（项目）
**描述：** 代表一个独立的产品或服务线，包含一组多语言文案

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 项目的唯一标识符 |
| name | String(100) | NOT NULL | 项目名称 |
| description | String(500) | NULLABLE | 项目描述 |
| owner_id | UUID | NOT NULL | 项目所有者的用户ID |
| languages | JSON | NOT NULL | 支持的语言列表（JSON数组） |
| created_at | Timestamp | NOT NULL | 创建时间 |
| updated_at | Timestamp | NOT NULL | 最后更新时间 |

**索引：**
- PRIMARY KEY: `id`
- SECONDARY INDEX: `owner_id` (用于查询用户的所有项目)
- INDEX: `created_at`, `updated_at` (用于排序)

### 2.2 Translation（翻译文案）
**描述：** 单条翻译文案，包含12种语言的文本和唯一标识符

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 文案的唯一标识符（自动生成的UUID） |
| project_id | UUID | FOREIGN KEY | 所属项目的ID |
| text_cn | String(500) | NULLABLE | 中文文本 |
| text_da | String(500) | NULLABLE | 丹麦语文本 |
| text_de | String(500) | NULLABLE | 德语文本 |
| text_en | String(500) | NULLABLE | 英语文本 |
| text_es | String(500) | NULLABLE | 西班牙语文本 |
| text_fi | String(500) | NULLABLE | 芬兰语文本 |
| text_fr | String(500) | NULLABLE | 法语文本 |
| text_it | String(500) | NULLABLE | 意大利语文本 |
| text_nl | String(500) | NULLABLE | 荷兰语文本 |
| text_no | String(500) | NULLABLE | 挪威语文本 |
| text_pl | String(500) | NULLABLE | 波兰语文本 |
| text_se | String(500) | NULLABLE | 瑞典语文本 |
| context | String(200) | NULLABLE | 上下文信息（预留字段） |
| created_at | Timestamp | NOT NULL | 创建时间 |
| updated_at | Timestamp | NOT NULL | 最后更新时间 |

**索引：**
- PRIMARY KEY: `id`
- SECONDARY INDEX: `project_id` (用于查询项目的所有文案)
- INDEX: `updated_at` (用于按更新时间排序)

### 2.3 User（用户）
**描述：** 系统用户，可以是产品经理、开发人员、系统管理员或技术支持

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 用户的唯一标识符 |
| username | String(50) | NOT NULL | 用户名（用于登录） |
| email | String(100) | NULLABLE | 邮箱地址 |
| role | Enum | NOT NULL | 用户角色（PM, DEV, ADMIN, SUPPORT） |
| api_key | String(64) | NULLABLE | API密钥（用于开发人员） |
| api_secret | String(64) | NULLABLE | API密钥的Secret（用于开发人员） |
| permissions | JSON | NOT NULL | 权限列表（JSON数组） |
| created_at | Timestamp | NOT NULL | 创建时间 |
| updated_at | Timestamp | NOT NULL | 最后更新时间 |

**索引：**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `username` (用户名唯一)
- INDEX: `email`, `role`

### 2.4 OperationLog（操作日志）
**描述：** 记录所有系统操作，用于审计和故障排查

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 日志条目的唯一标识符 |
| user_id | UUID | FOREIGN KEY | 执行操作的用户ID |
| operation_type | Enum | NOT NULL | 操作类型（UPLOAD, DOWNLOAD, BATCH_IMPORT, BATCH_EXPORT, BATCH_UPDATE） |
| resource_type | Enum | NOT NULL | 资源类型（PROJECT, TRANSLATION, API） |
| resource_id | UUID | NULLABLE | 受影响的资源ID（项目ID或翻译ID） |
| status | Enum | NOT NULL | 操作状态（SUCCESS, FAILED, IN_PROGRESS） |
| details | JSON | NULLABLE | 操作详情（JSON格式） |
| error_code | String(50) | NULLABLE | 错误代码 |
| error_message | Text(500) | NULLABLE | 错误消息 |
| created_at | Timestamp | NOT NULL | 创建时间 |

**索引：**
- PRIMARY KEY: `id`
- SECONDARY INDEX: `user_id`, `operation_type`, `created_at`

### 2.5 APIKey（API密钥）
**描述：** 开发人员用于访问API的密钥管理

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | API密钥的唯一标识符 |
| user_id | UUID | FOREIGN KEY | 所属用户ID |
| key | String(64) | NOT NULL | API密钥（加密存储） |
| secret | String(64) | NOT NULL | API密钥的Secret（加密存储） |
| project_id | UUID | FOREIGN KEY | 关联的项目ID（NULL表示全局） |
| permissions | JSON | NOT NULL | 权限范围（READ, WRITE, ADMIN） |
| rate_limit | Integer | NOT NULL | 速率限制（每分钟请求数） |
| ip_whitelist | JSON | NULLABLE | IP白名单（JSON数组） |
| is_active | Boolean | NOT NULL | 是否激活 |
| expires_at | Timestamp | NULLABLE | 过期时间 |
| created_at | Timestamp | NOT NULL | 创建时间 |

**索引：**
- PRIMARY KEY: `id`
- SECONDARY INDEX: `user_id`, `key`
- UNIQUE INDEX: `key`

---

## 3. 实体关系图（ER图）

```
┌─────────────────────────────────────────────────────────────────┐
│                                                         │
│                   ┌──────────────────┐                      │
│                   │     User        │                      │
│                   └──────────────────┘                      │
│                         │                                 │
│         ┌─────────────────┴ 1..*                    │
│         │  Translation      │                      │
│         └─────────────────┘                      │
│                         │                                 │
│                   ┌──────────────────┐                      │
│                   │     Project       │                      │
│                   └──────────────────┘                      │
│                         │                                 │
│   ┌──────────────────┐                      │
│   │  APIKey          │                      │
│   └──────────────────┘                      │
│                         │                                 │
│   ┌──────────────────┐                      │
│   │ OperationLog     │                      │
│   └──────────────────┘                      │
└─────────────────────────────────────────────────────────┘

*表示一对多关系
```

**关系说明：**

| 关系 | 基数 | 说明 |
|------|------|------|
| User → Translation | 1:N | 一个用户可以管理多个文案（产品经理）|
| User → Project | 1:N | 一个用户可以拥有多个项目（产品经理）|
| Project → Translation | 1:N | 一个项目包含多个文案 |
| User → APIKey | 1:1 | 一个用户可以有一个API密钥（开发人员）|
| APIKey → Project | N:1 | 一个API密钥可以关联到一个项目（可选）|
| User → OperationLog | 1:N | 一个用户可以执行多个操作 |
| OperationLog → Translation | N:1 | 操作日志可以记录对文案的修改 |
| OperationLog → Project | N:1 | 操作日志可以记录对项目的操作 |

---

## 4. 数据库表结构

### 4.1 projects 表
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    owner_id UUID NOT NULL,
    languages JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_created ON projects(created_at);
CREATE INDEX idx_projects_updated ON projects(updated_at);
```

### 4.2 translations 表
```sql
CREATE TABLE translations (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    text_cn VARCHAR(500),
    text_da VARCHAR(500),
    text_de VARCHAR(500),
    text_en VARCHAR(500) NOT NULL,
    text_es VARCHAR(500),
    text_fi VARCHAR(500),
    text_fr VARCHAR(500),
    text_it VARCHAR(500),
    text_nl VARCHAR(500),
    text_no VARCHAR(500),
    text_pl VARCHAR(500),
    text_se VARCHAR(500),
    context VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CHECK (
        text_en IS NOT NULL OR
        (text_cn IS NOT NULL OR
        text_da IS NOT NULL OR
        text_de IS NOT NULL OR
        text_es IS NOT NULL OR
        text_fi IS NOT NULL OR
        text_fr IS NOT NULL OR
        text_it IS NOT NULL OR
        text_nl IS NOT NULL OR
        text_no IS NOT NULL OR
        text_pl IS NOT NULL OR
        text_se IS NOT NULL)
    );

CREATE INDEX idx_translations_project ON translations(project_id);
CREATE INDEX idx_translations_updated ON translations(updated_at);
```

### 4.3 users 表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    role ENUM('PM', 'DEV', 'ADMIN', 'SUPPORT') NOT NULL,
    api_key VARCHAR(64),
    api_secret VARCHAR(64),
    permissions JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 4.4 operation_logs 表
```sql
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    operation_type ENUM('UPLOAD', 'DOWNLOAD', 'BATCH_IMPORT', 'BATCH_EXPORT', 'BATCH_UPDATE', 'API_CALL') NOT NULL,
    resource_type ENUM('PROJECT', 'TRANSLATION', 'API') NOT NULL,
    resource_id UUID,
    status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS') NOT NULL,
    details JSON,
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_type ON operation_logs(operation_type);
CREATE INDEX idx_operation_logs_created ON operation_logs(created_at);
```

### 4.5 api_keys 表
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    key VARCHAR(64) NOT NULL,
    secret VARCHAR(64) NOT NULL,
    project_id UUID,
    permissions JSON NOT NULL,
    rate_limit INTEGER DEFAULT 100,
    ip_whitelist JSON,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    UNIQUE KEY (key),
    CONSTRAINT chk_active_key CHECK (
        (is_active = true) OR
        (project_id IS NULL)
    )
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_project ON api_keys(project_id);
```

---

## 5. 数据迁移策略

### 5.1 初始数据导入
- 从Excel文件导入现有项目数据
- 为每条翻译文案生成唯一UUID
- 处理重复文案（合并或保留）

### 5.2 备份策略
- **数据库备份：** 每日凌晨3点自动备份
- **保留期：** 保留最近30天的备份
- **备份存储：** 异地存储（如S3）和本地备份
- **恢复预案：** 定义恢复步骤和RTO（恢复时间目标）

### 5.3 数据清理
- **软删除策略：** 使用`deleted_at`字段标记删除的记录，不物理删除
- **定期清理：** 每月清理超过90天的软删除记录
- **批量操作日志：** 清理超过6个月的详细操作日志

---

## 6. 性能优化策略

### 6.1 查询优化
- **分页查询：** 所有列表查询支持分页（每页100条）
- **索引使用：** 确保WHERE条件使用索引字段
- **避免N+1查询：** 使用JOIN而非子查询
- **查询缓存：** 对频繁查询的结果进行缓存

### 6.2 批量操作优化
- **批量插入：** 使用批量INSERT（每次最多1000条）
- **事务处理：** 批量操作使用事务确保一致性
- **异步处理：** 大型批量操作使用异步队列处理

### 6.3 连接池配置
- **最大连接数：** 20
- **最小空闲连接数：** 5
- **连接超时：** 30秒
- **连接生命周期：** 最长30分钟

---

## 7. 数据完整性约束

### 7.1 唯一性约束
- **UUID生成：** 使用UUID v4确保全局唯一性
- **事务隔离：** 使用SERIALIZABLE隔离级别处理批量操作
- **外键约束：** ON DELETE CASCADE确保数据完整性

### 7.2 数据验证
- **NOT NULL约束：** 所有关键字段设置NOT NULL约束
- **CHECK约束：** 确保至少一种语言有文本
- **长度约束：** 所有VARCHAR字段设置合理长度限制
- **JSON验证：** JSON字段在应用层验证格式

### 7.3 并发控制
- **乐观锁：** 对translations表使用version字段实现乐观锁
- **悲观锁：** 对projects表使用SELECT FOR UPDATE
- **重试机制：** 并发冲突时自动重试（最多3次）

---

## 8. 扩展字段预留

为支持未来功能，在translations表中预留以下扩展字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| version | Integer | 版本号（用于乐观锁） |
| is_deleted | Boolean | 软删除标记 |
| deleted_at | Timestamp | 删除时间 |
| tags | JSON | 标签（用于分类和搜索） |
| usage_count | Integer | 使用次数统计 |

---

## 9. 数据字典

### 9.1 项目状态枚举
```sql
CREATE TYPE project_status AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');
```

### 9.2 用户角色枚举
```sql
CREATE TYPE user_role AS ENUM ('PM', 'DEV', 'ADMIN', 'SUPPORT');
```

### 9.3 操作类型枚举
```sql
CREATE TYPE operation_type AS ENUM (
    'UPLOAD',           -- Excel上传
    'DOWNLOAD',         -- 文件下载
    'BATCH_IMPORT',     -- 批量导入
    'BATCH_EXPORT',     -- 批量导出
    'BATCH_UPDATE',     -- 批量更新
    'API_CALL',         -- API调用
    'BATCH_DELETE'      -- 批量删除
    'PROJECT_CREATE',    -- 项目创建
    'PROJECT_UPDATE',    -- 项目更新
    'PROJECT_DELETE'     -- 项目删除
    'AUTH'              -- 认证
    'BATCH_PREVIEW'     -- 批量预览
    'GENERATE_KEY'      -- 生成Key
    'IMPORT_SUCCESS',    -- 导入成功
    'IMPORT_FAILED'      -- 导入失败
    'EXPORT_SUCCESS',    -- 导出成功
    'EXPORT_FAILED'      -- 导出失败
);
```

### 9.4 操作状态枚举
```sql
CREATE TYPE operation_status AS ENUM ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'CANCELLED', 'TIMEOUT');
```

### 9.5 资源类型枚举
```sql
CREATE TYPE resource_type AS ENUM ('PROJECT', 'TRANSLATION', 'API_KEY', 'USER', 'FILE');
```

---

## 10. 附录

### 10.1 数据库技术栈建议
- **数据库：** PostgreSQL 14+ 或 MySQL 8.0+
- **ORM框架：** Prisma（推荐）或 TypeORM
- **连接池：** PgBouncer (PostgreSQL) 或 HikariCP (MySQL)
- **迁移工具：** Flyway 或 Liquibase

### 10.2 数据迁移脚本示例
```sql
-- 为现有项目导入数据
INSERT INTO translations (id, project_id, text_en, text_cn, created_at)
SELECT 
    gen_random_uuid() as id,
    'project-id-from-excel' as project_id,
    excel_column_en as text_en,
    excel_column_cn as text_cn,
    CURRENT_TIMESTAMP as created_at
FROM (
    SELECT * FROM temp_excel_imports
);
```

---

**文档版本控制：** v1.0
**最后更新：** 2026-02-27
