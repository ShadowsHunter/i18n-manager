# 架构决策文档

**项目：** MultiLanguageManager
**版本：** 1.0
**作者：** hunter
**日期：** 2026-02-27

---

## 步骤2：项目上下文分析

### 项目需求审查

**项目定位：**
- **类型：** 内部开发工具服务
- **目标用户：** 产品经理、开发人员、系统管理员、技术支持、多项目管理员
- **核心价值：** 三端多语言文案一致性管理

**功能需求概览：**
- **功能需求数量：** 70 个 FRs
- **能力领域：** 10 个
- **史诗数量估计：** 15-20 个史诗（基于 FR 数量）

### 功能需求分析

#### 1. 需求概览

**70 个功能需求**分布在以下能力领域：

| 能力领域 | FR 数量 | 核心功能 |
|---------|---------|---------|
| 用户认证和项目管理 | 4 | 基础认证、项目 CRUD |
| 项目配置和管理 | 6 | 项目创建、配置、列表 |
| Excel 文件管理 | 7 | Excel 上传、预览、解析 |
| 文案管理和生成 | 10 | UUID 生成、多语言存储 |
| 多平台格式转换 | 6 | iOS、Android、Web 格式 |
| API 和脚本支持 | 12 | API 端点、认证、速率限制 |
| 批量操作 | 8 | 批量导入、导出、更新、删除 |
| 监控和日志 | 8 | 系统监控、API 性能、操作日志 |
| 用户通知和协作 | 3 | 通知、邮件、Slack 集成 |
| 文档和帮助 | 6 | FAQ、指南、诊断工具 |

#### 2. 架构影响分析

**技术领域识别：**

| 技术领域 | 关键 FRs | 架构影响 |
|---------|---------|---------|
| 用户管理 | FR1-FR4 | 需要用户服务 + 认证中间件 |
| 项目管理 | FR5-FR10 | 需要项目服务 + 权限控制 |
| Excel 处理 | FR11-FR17 | 需要文件上传服务 + Excel 解析器 + 异步处理 |
| 文案管理 | FR18-FR27 | 需要数据库服务 + UUID 生成器 + 缓存层 |
| 格式转换 | FR28-FR33 | 需要转换服务 + 字符编码处理 |
| API 服务 | FR34-FR45 | 需要 API 网关 + 认证服务 + 速率限制 |
| 批量操作 | FR46-FR53 | 需要异步任务队列 + 事务管理 |
| 监控 | FR54-FR61 | 需要监控服务 + 日志收集 + 告警系统 |
| 实时性 | WebSocket/SSE | 需要 WebSocket/SSE 服务器 + 消息队列 |

### 非功能需求分析

#### 1. 核心质量属性

**31 个 NFRs**按类别分组：

| NFR 类别 | NFR 数量 | 关键要求 |
|---------|---------|---------|
| 性能 | 8 | API 响应时间、Excel 解析、页面加载 |
| 安全性 | 8 | API 加密、HTTPS、IP 白名单、速率限制 |
| 可扩展性 | 6 | 并发支持、数据模型扩展、缓存 |
| 可访问性 | 4 | WCAG AA、键盘导航、ARIA 标签 |
| 集成 | 5 | 脚本、CI/CD、通知系统 |

#### 2. 架构驱动决策

**性能架构（8 个 NFRs）：**
- **API 响应时间 < 10 秒**（1000 条文案）→ 需要缓存层、数据库查询优化、CDN
- **Excel 解析 < 30 秒**（1000 条文案）→ 需要异步处理、流式解析
- **页面加载 < 2 秒**→ 需要代码分割、懒加载、资源优化
- **交互响应 < 500ms**→ 需要前端性能优化、服务端 API 优化

**安全性架构（8 个 NFRs）：**
- **API Key 加密存储**→ 需要加密模块（AES-256）
- **HTTPS 传输**→ 需要 SSL/TLS 证书
- **速率限制**→ 需要限流中间件（如 Redis + Lua 或 Nginx 限流）
- **IP 白名单**→ 需要防火墙规则或应用层 IP 检查

**可扩展性架构（6 个 NFRs）：**
- **支持 10-20 并发用户**→ 需要连接池（PgBouncer 或 HikariCP）
- **支持 10x 用户增长**→ 需要读写分离、数据库水平扩展
- **批量操作**→ 需要异步任务队列（如 Celery 或 Bull）
- **文件缓存**→ 需要对象存储（如 S3）+ CDN

**可访问性架构（4 个 NFRs）：**
- **WCAG AA**→ 需要可访问性测试工具、ARIA 属性
- **键盘导航**→ 需要焦点管理、快捷键
- **屏幕阅读器**→ 需要语义化 HTML

**集成架构（5 个 NFRs）：**
- **脚本（Groovy、Shell、Node.js）**→ 需要脚本仓库和文档服务
- **CI/CD 集成**→ 需要 Webhook 支持或脚本触发器
- **通知（邮件、Slack）**→ 需要邮件服务（如 SendGrid）和 Slack Webhook

### 项目复杂度评估

#### 复杂度指标

| 指标 | 评估 | 说明 |
|-------|------|------|
| 用户类型数量 | 5 | 产品经理、开发人员、系统管理员、技术支持、多项目管理员 |
| 核心流程数量 | 5 | Excel 上传、格式转换、API 下载、批量操作、监控 |
| 技术领域数量 | 8 | 用户管理、项目管理、Excel 处理、文案管理、格式转换、API 服务、批量操作、监控、通知/协作、文档 |
| 集成复杂度 | 中等 | 脚本集成、CI/CD 集成、通知系统 |
| 数据模型复杂度 | 中等 | 4 个核心实体、多对多关系 |
| 性能要求 | 高 | 8 个性能 NFRs，其中多个有严格时间限制 |

**总体评估：** **中等偏高复杂度**

**理由：**
- 用户类型多样，每个有特定的需求
- 技术领域广泛，需要多个独立服务
- 集成需求较多（脚本、CI/CD、通知）
- 性能要求严格，需要优化策略

### 跨组件关注点

#### 1. 数据一致性

**关注点：**
- **并发冲突：** 批量操作时多个用户同时操作同一项目
- **事务一致性：** 批量更新多个项目时，如何确保全部成功或全部回滚
- **缓存一致性：** Excel 解析后缓存 vs 数据库直接查询的一致性

**架构建议：**
- 使用数据库事务（SERIALIZABLE 隔离级别）
- 实现乐观锁（version 字段）或悲观锁（SELECT FOR UPDATE）
- 实现缓存失效机制

#### 2. 实时更新

**关注点：**
- **WebSocket 连接管理：** 多个用户同时监控批量操作进度
- **消息广播：** 文案更新时如何通知所有连接的客户端
- **进度同步：** 前端如何实时显示多个后端任务的进度

**架构建议：**
- 使用 Redis Pub/Sub 作为消息总线
- WebSocket 服务器保持连接状态
- 前端使用 WebSocket/SSE 客户端连接重连机制

#### 3. 文件处理管道

**关注点：**
- **Excel 解析 vs 生成格式转换：** 是同步处理还是异步处理？
- **文件存储：** 生成的多语言文件是否需要持久化还是临时生成？
- **批量文件生成：** 108 个文件（3 项目 × 3 平台 × 12 语言）的生成策略

**架构建议：**
- 异步处理：Excel 上传后，解析和格式转换为后台任务
- 文件存储：使用对象存储（S3）存储生成的文件，提供临时下载 URL
- 批量生成：使用任务队列分批生成文件，避免内存溢出

#### 4. API 认证和授权

**关注点：**
- **API Key vs JWT：** 使用哪种认证机制？
- **权限粒度：** 是基于角色的粗粒度权限（PM、DEV、ADMIN）还是资源级权限（项目级）？
- **速率限制：** 是全局限制还是按用户、按 API Key？

**架构建议：**
- MVP 阶段：使用 API Key 简化实现
- Growth 阶段：支持 JWT Token，提供更细粒度的权限
- 速率限制：使用 Redis 滑动窗口算法

### 分析摘要

#### 要求概览

**功能需求：** 70 个 FRs，组织为 10 个能力领域

**非功能需求：** 31 个 NFRs，涵盖性能、安全性、可扩展性、可访问性、集成

**项目复杂度：** 中等偏高复杂度

**核心架构领域：**
1. 用户管理 + 认证
2. 项目管理 + 权限控制
3. Excel 处理 + 文件管理
4. 文案存储 + 缓存
5. API 网关 + 认证
6. 批量操作 + 事务管理
7. 监控 + 日志
8. 通知系统
9. 实时更新（WebSocket）
10. 脚本仓库 + 文档服务

#### 关键架构决策领域

基于分析，以下领域需要明确的架构决策：

1. **技术栈选择**
   - 前端框架（React/Vue）
   - 后端框架
   - 数据库（PostgreSQL/MySQL）
   - 缓存系统（Redis）
   - 消息队列（Redis/RabbitMQ）
   - 对象存储（S3/MinIO）

2. **服务架构**
   - 单体还是微服务架构
   - 服务拆分策略（按功能域还是按数据域）
   - 服务间通信协议（REST/gRPC）

3. **部署架构**
   - 容器化（Docker/Kubernetes）
   - 负载均衡策略
   - 自动扩缩容策略
   - CDN 配置

4. **安全架构**
   - 认证机制（API Key/JWT）
   - 加密策略（传输和静态）
   - API 网关（限流、IP 白名单）

5. **监控和日志架构**
   - 日志收集策略（集中式还是分布式）
   - 监控系统（Prometheus/Grafana）
   - 告警系统（邮件/Slack/PagerDuty）
   - 链路追踪（Sentry/DataDog）

---

## 步骤3：启动器模板评估

### 可用启动器模板

基于 MultiLanguageManager 的项目类型（Web 应用）和复杂度（中等偏高），以下是推荐的启动器模板：

#### 前端启动器模板

| 模板 | 框架 | 适用场景 | 优势 |
|------|------|---------|------|
| **Next.js App Router** | React | SSR、SEO、全栈应用 | 服务端渲染、API 路由、优化友好 |
| **Vite + React** | React | SPA、客户端渲染 | 快速开发、热更新、插件丰富 |
| **Vite + Vue** | Vue | SPA、客户端渲染 | 渐进式框架、易上手 |
| **Create React App** | React | SPA、传统方式 | 官方模板、稳定 |

#### 后端启动器模板

| 模板 | 框架 | 适用场景 | 优势 |
|------|------|---------|------|
| **Express Generator** | Express | 传统 Node.js 应用 | 灵活、中间件丰富 |
| **NestJS CLI** | NestJS | 企业级应用、微服务 | TypeScript、依赖注入、模块化 |
| **FastAPI Starter** | FastAPI | 高性能 API | 异步、自动文档、类型提示 |
| **Spring Boot Initializr** | Spring Boot | Java 企业应用 | 成熟生态、Spring 全家桶 |

#### 全栈启动器模板

| 模板 | 技术栈 | 适用场景 | 优势 |
|------|--------|---------|------|
| **T3 Stack** | Next.js + Prisma + tRPC | 全栈应用、类型安全 | 端到端类型安全、现代化 |
| **Nx Workspace** | 多框架 | Monorepo、微前端 | 代码共享、统一管理 |
| **RedwoodJS** | React + Prisma | 全栈应用、约定优于配置 | 自动生成、快速开发 |

### 推荐方案

基于 MultiLanguageManager 的需求，推荐以下启动器模板组合：

#### 方案 A：现代化全栈（推荐）

**技术栈：**
- **前端：** Next.js 14+ (App Router)
- **后端：** NestJS
- **数据库：** Prisma + PostgreSQL
- **缓存：** Redis
- **任务队列：** Bull (基于 Redis)
- **对象存储：** MinIO (或 S3)
- **API 文档：** Swagger/OpenAPI

**优势：**
- Next.js 提供优秀的开发体验和性能优化
- NestJS 提供企业级架构和模块化
- Prisma 提供类型安全的数据库访问
- 完整的 TypeScript 支持
- 丰富的生态系统

**项目初始化命令：**
```bash
# 创建前端项目
npx create-next-app@latest frontend --typescript --tailwind --app

# 创建后端项目
npx @nestjs/cli new backend --package-manager npm
```

#### 方案 B：简化技术栈（适合小团队）

**技术栈：**
- **前端：** Vite + React
- **后端：** Express + TypeScript
- **数据库：** PostgreSQL
- **缓存：** Redis
- **任务队列：** Bull
- **对象存储：** 本地文件系统（MVP）→ MinIO (Growth)

**优势：**
- 学习曲线较平缓
- 开发速度快
- 社区资源丰富

**项目初始化命令：**
```bash
# 创建前端项目
npm create vite@latest frontend -- --template react-ts

# 创建后端项目
mkdir backend && cd backend
npm init -y
npm install express typescript @types/node @types/express
```

#### 方案 C：Java 企业级（适合大团队）

**技术栈：**
- **前端：** Next.js 14+ (App Router)
- **后端：** Spring Boot 3.x
- **数据库：** PostgreSQL + JPA/Hibernate
- **缓存：** Redis (Spring Data Redis)
- **任务队列：** RabbitMQ
- **对象存储：** MinIO (或 S3)
- **API 文档：** SpringDoc OpenAPI

**优势：**
- Spring Boot 成熟稳定
- 企业级安全性
- 丰富的中间件
- 适合大规模团队

**项目初始化命令：**
```bash
# 创建前端项目
npx create-next-app@latest frontend --typescript --tailwind --app

# 创建后端项目（使用 Spring Initializr）
# 访问 https://start.spring.io/ 选择依赖
```

### 技术栈选择

**✅ 已确定的技术栈：**

#### 前端技术栈
- **框架：** Vue 3
- **构建工具：** Vite
- **语言：** TypeScript
- **UI 组件库：** Element Plus / Ant Design Vue
- **状态管理：** Pinia
- **路由：** Vue Router 4
- **HTTP 客户端：** Axios
- **实时通信：** Socket.io-client / EventSource

#### 后端技术栈
- **框架：** Express
- **语言：** TypeScript
- **ORM：** Prisma（支持 PostgreSQL 和 MySQL）
- **数据库：** PostgreSQL 14+（兼容 MySQL 8.0+）
- **缓存：** Redis 7+
- **任务队列：** Bull（基于 Redis）
- **对象存储：** 本地文件系统（MVP）→ MinIO（Growth）
- **文件上传：** Multer
- **Excel 解析：** ExcelJS / xlsx
- **API 文档：** Swagger/OpenAPI (swagger-jsdoc)
- **认证：** JWT + API Key
- **实时通信：** Socket.io
- **日志：** Winston
- **环境变量：** dotenv
- **验证：** Joi / Zod
- **测试：** Jest + Supertest

#### 开发工具
- **包管理器：** npm / pnpm
- **代码规范：** ESLint + Prettier
- **Git Hooks：** Husky + lint-staged
- **类型检查：** TypeScript
- **API 测试：** Postman / Insomnia
- **容器化：** Docker / Docker Compose

### 技术栈优势

**前端（Vite + Vue3）：**
- Vite 提供极快的冷启动和热更新
- Vue 3 组合式 API 提供更好的代码组织
- TypeScript 提供类型安全
- Pinia 状态管理简单高效
- 丰富的 Vue 3 生态系统

**后端（Express + TypeScript）：**
- Express 灵活，中间件丰富
- TypeScript 提供类型安全和更好的开发体验
- Prisma ORM 提供类型安全的数据库访问
- Bull 队列处理异步任务
- 模块化架构易于扩展

**数据库（PostgreSQL 兼容 MySQL）：**
- PostgreSQL 功能强大，支持 JSONB、全文搜索
- 通过 Prisma ORM 可以轻松切换到 MySQL
- 适合内部开发工具的性能需求

**缓存（Redis）：**
- 高性能的内存数据库
- 支持多种数据结构
- Bull 队列基于 Redis 实现
- 支持 Pub/Sub 消息总线

### 项目初始化命令

**前端项目：**
```bash
# 创建 Vite + Vue3 + TypeScript 项目
npm create vite@latest frontend -- --template vue-ts

# 安装依赖
cd frontend
npm install

# 安装额外依赖
npm install vue-router@4 pinia axios socket.io-client
npm install element-plus @element-plus/icons-vue

# 安装开发依赖
npm install -D @types/node sass eslint-plugin-vue
```

**后端项目：**
```bash
# 创建后端项目目录
mkdir backend && cd backend

# 初始化 npm 项目
npm init -y

# 安装核心依赖
npm install express cors helmet morgan
npm install prisma @prisma/client
npm install socket.io bull
npm install xlsx multer winston
npm install jsonwebtoken bcryptjs
npm install dotenv joi

# 安装开发依赖
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/morgan @types/multer
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install -D ts-node nodemon
npm install -D jest ts-jest @types/jest supertest @types/supertest

# 初始化 TypeScript 配置
npx tsc --init

# 初始化 Prisma
npx prisma init
```

**数据库初始化：**
```bash
# 使用 Prisma 创建迁移
cd backend
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate

# 查看 Prisma Studio（可选）
npx prisma studio
```

### 项目结构

**前端项目结构：**
```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 资源文件
│   ├── components/         # Vue 组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   └── views/          # 页面组件
│   ├── composables/        # 组合式函数
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── api/                # API 调用
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .env                    # 环境变量
├── .eslintrc.cjs           # ESLint 配置
├── .prettierrc             # Prettier 配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── package.json            # 依赖配置
```

**后端项目结构：**
```
backend/
├── prisma/                 # Prisma ORM
│   ├── schema.prisma       # 数据库模型
│   ├── migrations/         # 数据库迁移
│   └── seed.ts             # 种子数据
├── src/
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── services/           # 业务逻辑
│   ├── models/             # 数据模型
│   ├── middlewares/        # 中间件
│   ├── routes/             # 路由定义
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型
│   ├── validators/         # 数据验证
│   ├── queue/              # Bull 队列
│   ├── websocket/          # WebSocket 服务
│   ├── app.ts              # Express 应用
│   └── server.ts           # 服务器入口
├── uploads/                # 文件上传目录
├── logs/                   # 日志文件
├── .env                    # 环境变量
├── .env.example            # 环境变量示例
├── .eslintrc.cjs           # ESLint 配置
├── .prettierrc             # Prettier 配置
├── tsconfig.json           # TypeScript 配置
├── nodemon.json            # Nodemon 配置
└── package.json            # 依赖配置
```

---

## 步骤4：服务架构设计

### 服务架构模式

基于 MultiLanguageManager 的需求和技术栈选择，推荐以下服务架构：

#### 架构模式：分层单体架构（Layered Monolith）

**理由：**
- MVP 阶段快速开发和部署
- 技术栈相对简单（Express + Prisma）
- 易于调试和维护
- 未来可演进为微服务架构

**分层结构：**
```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, Routes, WebSockets)    │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│     (Services, Validators, Utils)      │
├─────────────────────────────────────────┤
│         Data Access Layer              │
│       (Prisma ORM, Repository)         │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (Database, Redis, File Storage, Queue)│
└─────────────────────────────────────────┘
```

### 核心服务模块

#### 1. 用户认证服务
- **职责：** 用户注册、登录、Token 生成、权限验证
- **API 端点：** POST /api/v1/auth/login, POST /api/v1/auth/logout
- **依赖：** PostgreSQL, Redis
- **实现：** JWT + BCrypt

#### 2. 项目管理服务
- **职责：** 项目 CRUD、项目配置、权限控制
- **API 端点：** GET/POST /api/v1/projects, GET/PUT/DELETE /api/v1/projects/:id
- **依赖：** PostgreSQL, Redis
- **实现：** Prisma Service

#### 3. 文案管理服务
- **职责：** 文案 CRUD、UUID 生成、格式转换
- **API 端点：** GET/POST /api/v1/projects/:projectId/translations
- **依赖：** PostgreSQL, Redis
- **实现：** Prisma Service + Format Converter

#### 4. Excel 处理服务
- **职责：** Excel 上传、解析、验证、批量导入
- **API 端点：** POST /api/v1/projects/:projectId/upload
- **依赖：** Bull Queue, File Storage
- **实现：** ExcelJS Parser + Bull Worker

#### 5. 文件生成服务
- **职责：** 多语言文件生成、格式转换、ZIP 打包
- **API 端点：** GET /api/v1/projects/:projectId/download
- **依赖：** Redis (Cache), File Storage
- **实现：** Format Generator + ZIP Archiver

#### 6. 批量操作服务
- **职责：** 批量导入、导出、更新、删除
- **API 端点：** POST /api/v1/batch/import, POST /api/v1/batch/export
- **依赖：** Bull Queue, PostgreSQL (Transaction)
- **实现：** Bull Worker + Transaction Manager

#### 7. API Key 管理服务
- **职责：** API Key 生成、验证、速率限制
- **API 端点：** GET/POST /api/v1/api-keys, DELETE /api/v1/api-keys/:id
- **依赖：** PostgreSQL, Redis
- **实现：** JWT + Rate Limiter

#### 8. 监控和日志服务
- **职责：** 系统监控、日志收集、告警
- **API 端点：** GET /api/v1/logs/audit, GET /api/v1/logs/upload
- **依赖：** Winston, Redis
- **实现：** Winston Logger + Metrics Collector

#### 9. 通知服务
- **职责：** 邮件通知、Slack 通知、WebSocket 推送
- **API 端点：** POST /api/v1/notifications
- **依赖：** Socket.io, Nodemailer, Slack Webhook
- **实现：** Notification Service + WebSocket Emitter

#### 10. 文档服务
- **职责：** API 文档、FAQ、使用指南
- **API 端点：** GET /api/v1/docs, GET /api/v1/templates/excel
- **依赖：** Swagger/OpenAPI, File Storage
- **实现：** Swagger UI + Static Files

### 服务间通信

#### RESTful API
- 主要的服务间通信方式
- 基于标准 HTTP 方法（GET, POST, PUT, DELETE）
- JSON 格式请求和响应

#### WebSocket
- 实时更新推送（批量操作进度）
- 使用 Socket.io 实现
- 房间（Room）机制按操作 ID 分组

#### Redis Pub/Sub
- 缓存失效通知
- 消息广播
- 跨服务解耦

#### Bull Queue
- 异步任务处理（Excel 解析、文件生成）
- 任务优先级
- 任务重试机制

---

## 步骤5：部署架构设计

### 部署架构模式

基于 MultiLanguageManager 的部署需求，推荐以下部署架构：

#### 部署模式：容器化部署（Docker + Docker Compose）

**理由：**
- MVP 阶段快速部署
- 环境一致性保证
- 易于扩展和维护
- 未来可迁移到 Kubernetes

**部署架构：**
```
┌─────────────────────────────────────────┐
│           Nginx (Reverse Proxy)         │
│              Port 80/443                │
├─────────────────────────────────────────┤
│         Vue3 SPA (Static Files)        │
│              Port 8080                 │
├─────────────────────────────────────────┤
│      Express Backend (Node.js)         │
│              Port 3000                 │
├─────────────────────────────────────────┤
│         PostgreSQL (Database)          │
│              Port 5432                 │
├─────────────────────────────────────────┤
│           Redis (Cache/Queue)           │
│              Port 6379                 │
└─────────────────────────────────────────┘
```

### 容器化配置

#### 前端容器

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

#### 后端容器

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  frontend:
    build: ./frontend
    expose:
      - "8080"
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/multilanguage
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=multilanguage
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 负载均衡策略

#### Nginx 配置

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        least_conn;
        server backend:3000;
        # 未来可添加多个后端实例
        # server backend2:3000;
        # server backend3:3000;
    }

    server {
        listen 80;
        server_name api.multilanguage.internal;

        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 自动扩缩容策略（Post-MVP）

#### Kubernetes 配置（Post-MVP 阶段）

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: multilanguage/backend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### CDN 配置（Post-MVP）

#### CDN 策略
- **静态资源：** 使用 CDN 加速前端资源
- **API 响应缓存：** 缓存不频繁变更的 API 响应
- **文件下载：** 使用 CDN 加速 ZIP 文件下载

**CDN 配置示例（CloudFlare/阿里云CDN）：**
```
静态资源缓存：1 天
API 响应缓存：5 分钟
ZIP 文件缓存：24 小时
```

---

## 步骤6：架构模式设计

### 设计模式（Design Patterns）

基于 MultiLanguageManager 的技术栈和需求，以下是推荐的设计模式：

#### 创建型模式（Creational Patterns）

##### 1. 工厂模式（Factory Pattern）

**应用场景：**
- 文件格式转换器工厂（iOS、Android、Web 格式）
- 验证器工厂（不同的数据验证器）
- 服务实例工厂（根据配置创建不同服务）

**实现示例：**
```typescript
// 文件格式转换器工厂
class FormatConverterFactory {
    static create(platform: 'ios' | 'android' | 'web'): FormatConverter {
        switch (platform) {
            case 'ios':
                return new IOSFormatConverter();
            case 'android':
                return new AndroidFormatConverter();
            case 'web':
                return new WebFormatConverter();
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}
```

##### 2. 单例模式（Singleton Pattern）

**应用场景：**
- Redis 连接池
- 数据库连接池
- Logger 实例
- 配置管理器

**实现示例：**
```typescript
// Redis 单例
class RedisClient {
    private static instance: Redis;

    private constructor() {
        // 私有构造函数
    }

    static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis({
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
            });
        }
        return RedisClient.instance;
    }
}
```

##### 3. 建造者模式（Builder Pattern）

**应用场景：**
- 查询构建器（复杂 SQL 查询）
- API 响应构建器
- Excel 导出构建器

**实现示例：**
```typescript
// 查询构建器
class TranslationQueryBuilder {
    private query: Prisma.TranslationFindManyArgs = {};

    where(projectId: string): this {
        this.query.where = { ...this.query.where, projectId };
        return this;
    }

    search(keyword: string): this {
        this.query.where = {
            ...this.query.where,
            OR: [
                { keyUuid: { contains: keyword, mode: 'insensitive' } },
                { textCn: { contains: keyword, mode: 'insensitive' } },
                { textEn: { contains: keyword, mode: 'insensitive' } },
            ],
        };
        return this;
    }

    limit(limit: number): this {
        this.query.take = limit;
        return this;
    }

    async execute() {
        return await prisma.translation.findMany(this.query);
    }
}
```

#### 结构型模式（Structural Patterns）

##### 1. 适配器模式（Adapter Pattern）

**应用场景：**
- 不同平台格式转换适配器（iOS、Android、Web）
- 第三方服务适配器（邮件服务、Slack 服务）
- 存储适配器（本地文件系统、MinIO、S3）

**实现示例：**
```typescript
// 存储适配器接口
interface StorageAdapter {
    upload(file: File, path: string): Promise<string>;
    download(path: string): Promise<Buffer>;
    delete(path: string): Promise<void>;
}

// 本地文件系统适配器
class LocalStorageAdapter implements StorageAdapter {
    async upload(file: File, path: string): Promise<string> {
        // 实现本地文件上传
    }

    async download(path: string): Promise<Buffer> {
        // 实现本地文件下载
    }

    async delete(path: string): Promise<void> {
        // 实现本地文件删除
    }
}

// MinIO 适配器
class MinioStorageAdapter implements StorageAdapter {
    async upload(file: File, path: string): Promise<string> {
        // 实现 MinIO 文件上传
    }

    async download(path: string): Promise<Buffer> {
        // 实现 MinIO 文件下载
    }

    async delete(path: string): Promise<void> {
        // 实现 MinIO 文件删除
    }
}

// 存储适配器工厂
class StorageAdapterFactory {
    static create(type: 'local' | 'minio' | 's3'): StorageAdapter {
        switch (type) {
            case 'local':
                return new LocalStorageAdapter();
            case 'minio':
                return new MinioStorageAdapter();
            default:
                throw new Error(`Unsupported storage type: ${type}`);
        }
    }
}
```

##### 2. 装饰器模式（Decorator Pattern）

**应用场景：**
- 中间件（Express 中间件）
- 缓存装饰器（为服务方法添加缓存）
- 日志装饰器（为方法添加日志记录）
- 认证装饰器（为路由添加认证）

**实现示例：**
```typescript
// 缓存装饰器
function Cacheable(cacheKey: string, ttl: number = 3600) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const redis = RedisClient.getInstance();
            const key = `${cacheKey}:${JSON.stringify(args)}`;

            // 尝试从缓存获取
            const cached = await redis.get(key);
            if (cached) {
                return JSON.parse(cached);
            }

            // 调用原始方法
            const result = await originalMethod.apply(this, args);

            // 设置缓存
            await redis.setex(key, ttl, JSON.stringify(result));

            return result;
        };
    };
}

// 使用缓存装饰器
class TranslationService {
    @Cacheable('translations', 3600)
    async getTranslations(projectId: string): Promise<Translation[]> {
        return await prisma.translation.findMany({
            where: { projectId },
        });
    }
}
```

##### 3. 外观模式（Facade Pattern）

**应用场景：**
- 批量操作外观（简化批量操作 API）
- Excel 处理外观（简化 Excel 上传和解析）
- 文件生成外观（简化多语言文件生成）

**实现示例：**
```typescript
// 批量操作外观
class BatchOperationFacade {
    async importProjects(files: File[]): Promise<BatchOperationResult> {
        // 1. 验证文件
        const validatedFiles = await this.validator.validate(files);

        // 2. 创建批量操作记录
        const operation = await this.createOperation('import', validatedFiles);

        // 3. 添加任务到队列
        for (const file of validatedFiles) {
            await this.queue.add('import', { file, operationId: operation.id });
        }

        // 4. 返回操作结果
        return operation;
    }

    async exportProjects(projectIds: string[]): Promise<BatchOperationResult> {
        // 1. 验证项目
        const projects = await this.validator.validateProjects(projectIds);

        // 2. 创建批量操作记录
        const operation = await this.createOperation('export', projects);

        // 3. 添加任务到队列
        for (const project of projects) {
            await this.queue.add('export', { project, operationId: operation.id });
        }

        // 4. 返回操作结果
        return operation;
    }
}
```

#### 行为型模式（Behavioral Patterns）

##### 1. 策略模式（Strategy Pattern）

**应用场景：**
- 不同的认证策略（API Key、JWT）
- 不同的速率限制策略（固定窗口、滑动窗口、令牌桶）
- 不同的文件格式转换策略（iOS、Android、Web）

**实现示例：**
```typescript
// 认证策略接口
interface AuthenticationStrategy {
    authenticate(request: Request): Promise<User | null>;
}

// API Key 认证策略
class APIKeyAuthStrategy implements AuthenticationStrategy {
    async authenticate(request: Request): Promise<User | null> {
        const apiKey = request.headers['authorization']?.replace('ApiKey ', '');
        const keyRecord = await prisma.apiKey.findUnique({
            where: { keyHash: hash(apiKey) },
            include: { user: true },
        });

        if (!keyRecord || !keyRecord.isActive) {
            return null;
        }

        return keyRecord.user;
    }
}

// JWT 认证策略
class JWTAuthStrategy implements AuthenticationStrategy {
    async authenticate(request: Request): Promise<User | null> {
        const token = request.headers['authorization']?.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        return user;
    }
}

// 认证策略工厂
class AuthStrategyFactory {
    static create(type: 'apikey' | 'jwt'): AuthenticationStrategy {
        switch (type) {
            case 'apikey':
                return new APIKeyAuthStrategy();
            case 'jwt':
                return new JWTAuthStrategy();
            default:
                throw new Error(`Unsupported auth type: ${type}`);
        }
    }
}
```

##### 2. 观察者模式（Observer Pattern）

**应用场景：**
- WebSocket 事件监听（批量操作进度更新）
- 缓存失效事件监听
- 通知系统（邮件、Slack 通知）

**实现示例：**
```typescript
// 事件接口
interface Event {
    type: string;
    data: any;
}

// 观察者接口
interface Observer {
    update(event: Event): void;
}

// 主题接口
interface Subject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(event: Event): void;
}

// 批量操作进度主题
class BatchOperationProgressSubject implements Subject {
    private observers: Observer[] = [];

    attach(observer: Observer): void {
        this.observers.push(observer);
    }

    detach(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notify(event: Event): void {
        this.observers.forEach(observer => observer.update(event));
    }

    emitProgress(operationId: string, progress: number): void {
        this.notify({
            type: 'progress',
            data: { operationId, progress },
        });
    }
}

// WebSocket 观察者
class WebSocketObserver implements Observer {
    constructor(private io: SocketIO.Server) {}

    update(event: Event): void {
        if (event.type === 'progress') {
            this.io.to(event.data.operationId).emit('progress', event.data);
        }
    }
}
```

##### 3. 命令模式（Command Pattern）

**应用场景：**
- Bull 队列任务（Excel 解析、文件生成）
- 批量操作命令
- 撤销/重做操作（Post-MVP）

**实现示例：**
```typescript
// 命令接口
interface Command {
    execute(): Promise<any>;
    undo?(): Promise<any>;
}

// Excel 解析命令
class ExcelParseCommand implements Command {
    constructor(
        private file: File,
        private projectId: string,
    ) {}

    async execute(): Promise<ParseResult> {
        const workbook = await xlsx.readFile(this.file.path);
        const data = this.parseWorkbook(workbook);

        await prisma.translation.createMany({
            data: data.map(item => ({
                ...item,
                projectId: this.projectId,
            })),
        });

        return { success: true, rows: data.length };
    }

    async undo(): Promise<void> {
        await prisma.translation.deleteMany({
            where: { projectId: this.projectId },
        });
    }

    private parseWorkbook(workbook: XLSX.WorkBook): any[] {
        // Excel 解析逻辑
    }
}

// 命令工厂
class CommandFactory {
    static create(type: 'parse-excel' | 'generate-files', ...args: any[]): Command {
        switch (type) {
            case 'parse-excel':
                return new ExcelParseCommand(...args);
            default:
                throw new Error(`Unsupported command type: ${type}`);
        }
    }
}
```

##### 4. 模板方法模式（Template Method Pattern）

**应用场景：**
- 文件生成器模板（不同平台的文件生成）
- 验证器模板（不同类型的验证）
- 服务模板（不同的服务实现）

**实现示例：**
```typescript
// 文件生成器抽象类
abstract class FileGenerator {
    abstract generateContent(translations: Translation[]): string;
    abstract getExtension(): string;

    async generate(translations: Translation[]): Promise<GeneratedFile> {
        const content = this.generateContent(translations);
        const filename = `translations.${this.getExtension()}`;
        const path = path.join(this.outputDir, filename);

        await fs.writeFile(path, content);

        return { filename, path, content };
    }
}

// iOS 文件生成器
class IOSFileGenerator extends FileGenerator {
    generateContent(translations: Translation[]): string {
        let content = '/* iOS Strings File */\n';
        for (const translation of translations) {
            content += `"${translation.keyUuid}" = "${this.escapeString(translation.textEn)}";\n`;
        }
        return content;
    }

    getExtension(): string {
        return 'strings';
    }

    private escapeString(str: string): string {
        // 转义特殊字符
    }
}

// Android 文件生成器
class AndroidFileGenerator extends FileGenerator {
    generateContent(translations: Translation[]): string {
        let content = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
        for (const translation of translations) {
            content += `  <string name="${this.sanitizeKey(translation.keyUuid)}">${this.escapeXml(translation.textEn)}</string>\n`;
        }
        content += '</resources>';
        return content;
    }

    getExtension(): string {
        return 'xml';
    }

    private sanitizeKey(key: string): string {
        return key.replace(/-/g, '_').toLowerCase();
    }

    private escapeXml(str: string): string {
        // 转义 XML 特殊字符
    }
}
```

### 架构模式（Architectural Patterns）

#### 1. MVC 模式（Model-View-Controller）

**应用场景：**
- 前端架构（Vue3 组件）
- 后端架构（Express + Service）

**后端 MVC 结构：**
```
Models (Prisma Models)
    ↓
Views (API Responses)
    ↓
Controllers (Route Handlers)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
```

#### 2. 仓库模式（Repository Pattern）

**应用场景：**
- 数据访问层
- 封装数据库操作
- 提供统一的数据访问接口

**实现示例：**
```typescript
// 仓库接口
interface ITranslationRepository {
    findByProjectId(projectId: string): Promise<Translation[]>;
    findByKey(keyUuid: string): Promise<Translation | null>;
    create(data: Prisma.TranslationCreateInput): Promise<Translation>;
    update(id: string, data: Prisma.TranslationUpdateInput): Promise<Translation>;
    delete(id: string): Promise<Translation>;
}

// 仓库实现
class TranslationRepository implements ITranslationRepository {
    async findByProjectId(projectId: string): Promise<Translation[]> {
        return await prisma.translation.findMany({
            where: { projectId },
        });
    }

    async findByKey(keyUuid: string): Promise<Translation | null> {
        return await prisma.translation.findUnique({
            where: { keyUuid },
        });
    }

    async create(data: Prisma.TranslationCreateInput): Promise<Translation> {
        return await prisma.translation.create({ data });
    }

    async update(id: string, data: Prisma.TranslationUpdateInput): Promise<Translation> {
        return await prisma.translation.update({ where: { id }, data });
    }

    async delete(id: string): Promise<Translation> {
        return await prisma.translation.delete({ where: { id } });
    }
}
```

#### 3. 依赖注入（Dependency Injection）

**应用场景：**
- Service 依赖注入
- 测试友好
- 降低耦合

**实现示例：**
```typescript
// 依赖容器
class DIContainer {
    private services: Map<string, any> = new Map();

    register<T>(name: string, factory: () => T): void {
        this.services.set(name, factory());
    }

    get<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }
        return service as T;
    }
}

// 注册服务
const container = new DIContainer();
container.register('translationService', () => new TranslationService());
container.register('fileGenerator', () => new FileGenerator());
container.register('storageAdapter', () => StorageAdapterFactory.create('local'));

// 使用服务
const translationService = container.get<TranslationService>('translationService');
const fileGenerator = container.get<FileGenerator>('fileGenerator');
```

#### 4. 中间件模式（Middleware Pattern）

**应用场景：**
- Express 中间件
- 请求处理管道
- 认证、授权、日志记录

**实现示例：**
```typescript
// 认证中间件
function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// 速率限制中间件
function rateLimitMiddleware(limiter: RateLimiter) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip;
        const allowed = await limiter.check(key);

        if (!allowed) {
            return res.status(429).json({ error: 'Too many requests' });
        }

        next();
    };
}

// 使用中间件
app.use('/api', authMiddleware);
app.use('/api', rateLimitMiddleware(rateLimiter));
```

### 集成模式（Integration Patterns）

#### 1. API 网关模式（API Gateway Pattern）

**应用场景：**
- 统一 API 入口
- 请求路由
- 认证和授权
- 速率限制

**实现示例：**
```typescript
// API 网关
class APIGateway {
    private routes: Route[] = [];

    addRoute(route: Route): void {
        this.routes.push(route);
    }

    async handleRequest(req: Request): Promise<Response> {
        for (const route of this.routes) {
            if (this.matchRoute(route, req)) {
                return await route.handler(req);
            }
        }

        return { status: 404, body: 'Not Found' };
    }

    private matchRoute(route: Route, req: Request): boolean {
        // 路由匹配逻辑
    }
}

// 使用 API 网关
const gateway = new APIGateway();
gateway.addRoute({
    method: 'GET',
    path: '/api/v1/projects',
    handler: getProjectsHandler,
});
gateway.addRoute({
    method: 'POST',
    path: '/api/v1/projects/:projectId/upload',
    handler: uploadExcelHandler,
});
```

#### 2. 事件驱动架构（Event-Driven Architecture）

**应用场景：**
- 批量操作进度通知
- 缓存失效通知
- 文案更新通知

**实现示例：**
```typescript
// 事件总线
class EventBus {
    private listeners: Map<string, Function[]> = new Map();

    on(event: string, listener: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }

    emit(event: string, data: any): void {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(listener => listener(data));
    }

    off(event: string, listener: Function): void {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
}

// 使用事件总线
const eventBus = new EventBus();

// 监听事件
eventBus.on('translation.updated', (data) => {
    // 处理文案更新事件
    invalidateCache(data.projectId);
    notifyWebSocket(data.projectId);
});

// 触发事件
eventBus.emit('translation.updated', { projectId: 'xxx', translationId: 'yyy' });
```

### 数据访问模式（Data Access Patterns）

#### 1. 工作单元模式（Unit of Work Pattern）

**应用场景：**
- 事务管理
- 批量操作
- 数据一致性

**实现示例：**
```typescript
// 工作单元
class UnitOfWork {
    private transactions: Prisma.PrismaTransactionClient | null = null;

    async begin(): Promise<void> {
        this.transactions = await prisma.$transaction();
    }

    async commit(): Promise<void> {
        if (this.transactions) {
            await prisma.$executeRaw`COMMIT`;
            this.transactions = null;
        }
    }

    async rollback(): Promise<void> {
        if (this.transactions) {
            await prisma.$executeRaw`ROLLBACK`;
            this.transactions = null;
        }
    }

    getTransaction(): Prisma.PrismaTransactionClient {
        if (!this.transactions) {
            throw new Error('Transaction not started');
        }
        return this.transactions;
    }
}

// 使用工作单元
const unitOfWork = new UnitOfWork();
try {
    await unitOfWork.begin();

    const tx = unitOfWork.getTransaction();

    await tx.translation.create({ ...data1 });
    await tx.translation.create({ ...data2 });
    await tx.translation.create({ ...data3 });

    await unitOfWork.commit();
} catch (error) {
    await unitOfWork.rollback();
    throw error;
}
```

### 并发模式（Concurrency Patterns）

#### 1. 生产者-消费者模式（Producer-Consumer Pattern）

**应用场景：**
- Bull 队列
- Excel 解析任务
- 文件生成任务

**实现示例：**
```typescript
// 生产者
class TaskProducer {
    constructor(private queue: Queue) {}

    async produce(task: Task): Promise<void> {
        await this.queue.add('process', task);
    }
}

// 消费者
class TaskConsumer {
    constructor(private queue: Queue) {}

    async consume(): Promise<void> {
        this.queue.process('process', async (job: Job) => {
            const task = job.data;
            await this.processTask(task);
        });
    }

    private async processTask(task: Task): Promise<void> {
        // 处理任务逻辑
    }
}

// 使用生产者-消费者
const queue = new Queue('tasks', { connection: redis });
const producer = new TaskProducer(queue);
const consumer = new TaskConsumer(queue);

// 启动消费者
consumer.consume();

// 生产任务
producer.produce({ type: 'parse-excel', file: '...' });
```

#### 2. 发布-订阅模式（Pub/Sub Pattern）

**应用场景：**
- Redis Pub/Sub
- 缓存失效通知
- 实时消息广播

**实现示例：**
```typescript
// 发布者
class Publisher {
    constructor(private redis: Redis) {}

    async publish(channel: string, message: any): Promise<void> {
        await this.redis.publish(channel, JSON.stringify(message));
    }
}

// 订阅者
class Subscriber {
    constructor(private redis: Redis) {}

    async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
        const subscriber = this.redis.duplicate();
        await subscriber.subscribe(channel);
        subscriber.on('message', (_, message) => {
            callback(JSON.parse(message));
        });
    }
}

// 使用发布-订阅
const publisher = new Publisher(redis);
const subscriber = new Subscriber(redis);

// 订阅频道
subscriber.subscribe('cache.invalidated', (message) => {
    // 处理缓存失效
});

// 发布消息
publisher.publish('cache.invalidated', { key: 'translations:xxx' });
```

### 安全模式（Security Patterns）

#### 1. 认证模式（Authentication Pattern）

**应用场景：**
- API Key 认证
- JWT Token 认证
- OAuth 2.0（Post-MVP）

**实现示例：**
```typescript
// 认证服务
class AuthService {
    async authenticateWithAPIKey(apiKey: string): Promise<User | null> {
        const keyRecord = await prisma.apiKey.findUnique({
            where: { keyHash: hash(apiKey) },
            include: { user: true },
        });

        if (!keyRecord || !keyRecord.isActive) {
            return null;
        }

        // 更新最后使用时间
        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() },
        });

        return keyRecord.user;
    }

    async authenticateWithJWT(token: string): Promise<User | null> {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        return user;
    }

    generateJWT(user: User): string {
        return jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }
}
```

#### 2. 授权模式（Authorization Pattern）

**应用场景：**
- 基于角色的访问控制（RBAC）
- 基于资源的访问控制
- 权限中间件

**实现示例：**
```typescript
// 权限检查
class AuthorizationService {
    hasPermission(user: User, resource: string, action: string): boolean {
        const rolePermissions = this.getRolePermissions(user.role);

        return rolePermissions.some(
            permission => permission.resource === resource && permission.actions.includes(action)
        );
    }

    private getRolePermissions(role: string): Permission[] {
        const permissions: Record<string, Permission[]> = {
            product_manager: [
                { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
                { resource: 'translations', actions: ['create', 'read', 'update', 'delete'] },
            ],
            developer: [
                { resource: 'translations', actions: ['read'] },
                { resource: 'files', actions: ['download'] },
            ],
            admin: [
                { resource: '*', actions: ['*'] },
            ],
        };

        return permissions[role] || [];
    }
}

// 授权中间件
function authorize(resource: string, action: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        const authService = new AuthorizationService();

        if (!authService.hasPermission(user, resource, action)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
}

// 使用授权中间件
app.get('/api/v1/projects/:projectId', 
    authMiddleware, 
    authorize('projects', 'read'),
    getProjectHandler
);
```

#### 3. 加密模式（Encryption Pattern）

**应用场景：**
- API Key 加密存储
- 密码哈希
- 数据传输加密

**实现示例：**
```typescript
// 加密服务
class EncryptionService {
    private algorithm = 'aes-256-cbc';
    private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    private iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

    encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(encrypted: string): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    hashPassword(password: string): string {
        return bcrypt.hash(password, 10);
    }

    verifyPassword(password: string, hash: string): boolean {
        return bcrypt.compare(password, hash);
    }

    hashAPIKey(apiKey: string): string {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }
}

// 使用加密服务
const encryptionService = new EncryptionService();

// 加密 API Key
const encryptedKey = encryptionService.encrypt(apiKey);

// 哈希密码
const hashedPassword = encryptionService.hashPassword(password);
```

---

## 步骤7：架构验证

### 架构决策记录（ADR - Architecture Decision Records）

#### ADR-001: 选择分层单体架构而非微服务

**日期：** 2026-02-27
**状态：** 已接受

**背景：**
MultiLanguageManager 是一个内部开发工具服务，需要快速开发和部署。项目有多个功能领域（用户管理、项目管理、Excel 处理、文案管理等），但团队规模相对较小。

**决策：**
采用分层单体架构（Layered Monolith）而非微服务架构。

**理由：**
1. **开发速度：** 单体架构在 MVP 阶段开发和部署更快
2. **团队规模：** 当前团队规模小（2-3 人），微服务架构增加运维复杂度
3. **技术栈：** Express + Prisma 技术栈更适合单体架构
4. **可测试性：** 单体架构更容易进行集成测试
5. **未来扩展：** 单体架构可以演进为微服务架构（如通过模块化）

**后果：**
- **正面：** 快速交付 MVP、简化部署流程、降低运维成本
- **负面：** 未来拆分微服务需要重构、单点故障风险

**缓解措施：**
- 模块化架构设计，便于未来拆分
- 实现健康检查和监控
- 使用 Docker 容器化，便于扩展

---

#### ADR-002: 选择 Vite + Vue3 作为前端框架

**日期：** 2026-02-27
**状态：** 已接受

**背景：**
前端需要一个现代化的 SPA 框架，需要支持 TypeScript、状态管理、路由等功能。项目需要快速开发和良好的开发体验。

**决策：**
采用 Vite + Vue3 作为前端框架。

**理由：**
1. **开发体验：** Vite 提供极快的冷启动和热更新
2. **技术栈：** Vue3 组合式 API 提供更好的代码组织
3. **类型安全：** TypeScript 提供完整的类型支持
4. **生态系统：** Vue3 生态系统成熟，组件库丰富（Element Plus）
5. **学习曲线：** 相比 Next.js，学习曲线较平缓

**后果：**
- **正面：** 开发效率高、社区活跃、组件丰富
- **负面：** 不支持 SSR（不适用于 SEO，但内部工具不需要）

**缓解措施：**
- 使用 Pinia 状态管理
- 使用 Vue Router 4 路由
- 使用 TypeScript 类型安全

---

#### ADR-003: 选择 Express + TypeScript 作为后端框架

**日期：** 2026-02-27
**状态：** 已接受

**背景：**
后端需要一个灵活的 Node.js 框架，需要支持 TypeScript、中间件、RESTful API 等功能。项目需要快速开发和良好的类型安全。

**决策：**
采用 Express + TypeScript 作为后端框架。

**理由：**
1. **灵活性：** Express 中间件生态丰富，易于扩展
2. **类型安全：** TypeScript 提供完整的类型支持
3. **社区支持：** Express 是最流行的 Node.js 框架，社区资源丰富
4. **学习曲线：** 相比 NestJS，学习曲线较平缓
5. **性能：** Express 性能良好，满足项目需求

**后果：**
- **正面：** 开发速度快、生态丰富、类型安全
- **负面：** 需要手动实现依赖注入（对比 NestJS）

**缓解措施：**
- 使用 Prisma ORM 提供类型安全的数据库访问
- 实现分层架构，提高代码可维护性
- 使用依赖注入模式

---

#### ADR-004: 选择 PostgreSQL 作为主数据库

**日期：** 2026-02-27
**状态：** 已接受

**背景：**
项目需要一个功能强大的关系型数据库，需要支持 JSONB、全文搜索等功能。项目需要兼容 MySQL，以备未来切换。

**决策：**
采用 PostgreSQL 作为主数据库，使用 Prisma ORM 以兼容 MySQL。

**理由：**
1. **功能强大：** PostgreSQL 支持 JSONB、全文搜索、复杂查询
2. **性能：** PostgreSQL 在并发处理和复杂查询方面性能优秀
3. **扩展性：** PostgreSQL 支持水平扩展和读写分离
4. **兼容性：** 通过 Prisma ORM 可以轻松切换到 MySQL
5. **开源：** PostgreSQL 是开源数据库，无许可成本

**后果：**
- **正面：** 功能强大、性能优秀、扩展性好
- **负面：** 相比 MySQL，占用资源略多

**缓解措施：**
- 使用 Prisma ORM，便于未来切换到 MySQL
- 优化数据库查询，使用索引
- 使用连接池（PgBouncer）

---

#### ADR-005: 选择 Redis 作为缓存和任务队列

**日期：** 2026-02-27
**状态：** 已接受

**背景：**
项目需要一个高性能的缓存系统和任务队列，用于缓存数据、处理异步任务、实现 Pub/Sub 消息。

**决策：**
采用 Redis 作为缓存和任务队列，使用 Bull 队列。

**理由：**
1. **性能：** Redis 是内存数据库，性能极高
2. **多功能：** Redis 支持多种数据结构（String、Hash、List、Set、ZSet）
3. **队列支持：** Bull 基于 Redis 实现任务队列
4. **Pub/Sub：** Redis 支持 Pub/Sub 消息
5. **开源：** Redis 是开源数据库，无许可成本

**后果：**
- **正面：** 性能极高、功能丰富、易于集成
- **负面：** 内存成本高、需要持久化策略

**缓解措施：**
- 设置合理的 TTL（过期时间）
- 使用 Redis 持久化（RDB + AOF）
- 监控 Redis 内存使用率

---

#### ADR-006: 选择本地文件系统作为对象存储（MVP）

**日期：** 2026-02-27
**状态：** 已接受

**背景：**
项目需要一个对象存储系统，用于存储上传的 Excel 文件和生成的多语言文件。MVP 阶段需要快速部署，降低成本。

**决策：**
采用本地文件系统作为对象存储（MVP），Post-MVP 迁移到 MinIO 或 S3。

**理由：**
1. **简单性：** 本地文件系统最简单，无需额外配置
2. **成本：** 无需购买云存储服务
3. **部署：** Docker Compose 可以轻松挂载本地卷
4. **快速交付：** MVP 阶段快速开发和部署

**后果：**
- **正面：** 简单、成本低、快速部署
- **负面：** 不支持分布式、无法扩展到多实例

**缓解措施：**
- 使用存储适配器模式（StorageAdapter），便于未来切换到 MinIO 或 S3
- MVP 阶段单实例部署
- Post-MVP 迁移到 MinIO 或 S3

---

### 架构权衡分析（Trade-off Analysis）

#### 性能 vs 简化性

**决策：** MVP 阶段优先简化性，Post-MVP 优化性能

**权衡分析：**
- **简化性：** 本地文件系统、单体架构、简化缓存策略
- **性能：** 需要优化数据库查询、实现缓存、使用 CDN

**评估：**
- MVP 阶段：简化性 > 性能
- Growth 阶段：性能 > 简化性

---

#### 灵活性 vs 稳定性

**决策：** 使用适配器模式、工厂模式，提高灵活性

**权衡分析：**
- **灵活性：** 使用接口和抽象类，便于切换实现
- **稳定性：** 使用成熟的库和框架，避免过度设计

**评估：**
- 使用适配器模式（存储、认证）
- 使用工厂模式（格式转换器）
- 避免过度抽象

---

#### 开发速度 vs 代码质量

**决策：** MVP 阶段优先开发速度，Post-MVP 提高代码质量

**权衡分析：**
- **开发速度：** 使用简化技术栈、跳过部分测试、快速迭代
- **代码质量：** 使用 TypeScript、代码规范、单元测试

**评估：**
- MVP 阶段：开发速度 > 代码质量
- Growth 阶段：代码质量 > 开发速度

---

### 风险评估

#### 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Excel 解析失败 | 中 | 高 | 使用 ExcelJS 库、全面测试、提供错误提示 |
| 数据库性能瓶颈 | 中 | 高 | 使用索引、优化查询、连接池、缓存 |
| 并发冲突 | 低 | 高 | 使用事务、乐观锁/悲观锁、重试机制 |
| 文件存储扩展性 | 中 | 中 | 使用存储适配器、Post-MVP 迁移到 MinIO |
| WebSocket 连接管理 | 低 | 中 | 使用 Socket.io、心跳检测、重连机制 |

#### 业务风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 用户采纳率低 | 中 | 高 | 提供文档和培训、快速迭代、收集反馈 |
| 数据迁移失败 | 低 | 高 | 提供迁移工具、备份验证、逐步迁移 |
| 安全漏洞 | 低 | 高 | 使用 HTTPS、加密存储、速率限制、安全审计 |

#### 运维风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 单点故障 | 中 | 高 | 健康检查、监控告警、备份恢复 |
| 内存泄漏 | 低 | 高 | 内存监控、日志收集、定期重启 |
| 磁盘空间不足 | 中 | 中 | 定期清理、监控告警、自动扩容 |

---

### 技术债务管理

#### 已知技术债务

| 债务 | 优先级 | 计划解决时间 |
|------|--------|-------------|
| 使用本地文件系统（不支持分布式） | 高 | Post-MVP（MinIO/S3） |
| 使用 API Key 认证（不支持 JWT） | 中 | Growth 阶段（JWT） |
| 缺少自动化测试 | 高 | MVP 阶段（单元测试） |
| 缺少完整的 CI/CD 流程 | 中 | MVP 阶段（GitHub Actions） |
| 缺少监控和告警系统 | 中 | MVP 阶段（Prometheus + Grafana） |

#### 技术债务偿还计划

**MVP 阶段（1-2 个月）：**
- 添加单元测试（覆盖率 > 60%）
- 实现 CI/CD 流程
- 实现基础监控和告警

**Growth 阶段（3-6 个月）：**
- 迁移到 MinIO 对象存储
- 实现 JWT 认证
- 提高测试覆盖率（> 80%）
- 实现完整的监控和告警

**Expansion 阶段（7-12 个月）：**
- 优化数据库查询
- 实现 CDN 加速
- 实现读写分离
- 迁移到 Kubernetes

---

### 架构评审清单

#### 功能性
- [ ] 支持用户注册、登录、登出
- [ ] 支持项目 CRUD
- [ ] 支持 Excel 上传和解析
- [ ] 支持文案 CRUD 和 UUID 生成
- [ ] 支持三端格式转换（iOS、Android、Web）
- [ ] 支持 API 下载和脚本集成
- [ ] 支持批量操作（导入、导出、更新、删除）
- [ ] 支持实时进度推送（WebSocket）
- [ ] 支持监控和日志收集
- [ ] 支持通知系统（邮件、Slack）

#### 非功能性
- [ ] API 响应时间 < 10 秒（1000 条文案）
- [ ] Excel 解析时间 < 30 秒（1000 条文案）
- [ ] 页面加载时间 < 2 秒
- [ ] 交互响应时间 < 500ms
- [ ] 系统可用性 ≥ 99%
- [ ] 支持并发用户 10-20 人
- [ ] 支持 10x 用户增长
- [ ] API 加密存储
- [ ] HTTPS 传输
- [ ] 速率限制（100 次/分钟）

#### 安全性
- [ ] API Key 加密存储（AES-256）
- [ ] 密码哈希（BCrypt）
- [ ] HTTPS 传输（SSL/TLS）
- [ ] 速率限制（Redis）
- [ ] IP 白名单（可选）
- [ ] 输入验证（Joi）
- [ ] SQL 注入防护（Prisma ORM）
- [ ] XSS 防护（输入转义）
- [ ] CSRF 防护（CSRF Token）
- [ ] 文件上传安全（验证类型、大小、病毒扫描）

#### 可扩展性
- [ ] 数据库连接池（PgBouncer）
- [ ] Redis 缓存层
- [ ] Bull 任务队列
- [ ] 存储适配器（便于切换到 MinIO/S3）
- [ ] 模块化架构（便于拆分微服务）
- [ ] Docker 容器化
- [ ] 水平扩展（多实例）
- [ ] 负载均衡（Nginx）
- [ ] 自动扩缩容（Kubernetes HPA，Post-MVP）
- [ ] CDN 加速（Post-MVP）

#### 可维护性
- [ ] TypeScript 类型安全
- [ ] 分层架构（Controller → Service → Repository）
- [ ] 代码规范（ESLint + Prettier）
- [ ] 代码注释
- [ ] 文档（API 文档、代码文档）
- [ ] 日志记录（Winston）
- [ ] 错误处理（统一错误处理）
- [ ] 单元测试（Jest）
- [ ] 集成测试（Supertest）
- [ ] E2E 测试（Cypress，可选）

#### 可观测性
- [ ] 日志收集（Winston）
- [ ] 结构化日志（JSON 格式）
- [ ] 日志级别（Error、Warn、Info、Debug）
- [ ] 日志查询和过滤
- [ ] 系统监控（Prometheus，Post-MVP）
- [ ] 应用监控（Grafana，Post-MVP）
- [ ] 性能监控（响应时间、吞吐量）
- [ ] 告警系统（邮件、Slack，Post-MVP）
- [ ] 链路追踪（Sentry/DataDog，Post-MVP）
- [ ] 健康检查（/health 端点）

---

### 架构验证总结

#### 验证结果

**架构决策：** ✅ 通过验证

**关键发现：**
1. ✅ 技术栈选择合理，满足 MVP 和 Growth 阶段需求
2. ✅ 架构模式应用恰当，提高代码质量和可维护性
3. ✅ 部署架构简单高效，易于扩展
4. ⚠️ 存在部分技术债务，需要在 Post-MVP 解决
5. ✅ 安全措施完善，满足内部工具需求

**建议：**
1. MVP 阶段：优先开发核心功能，快速迭代
2. Growth 阶段：偿还技术债务，优化性能
3. Expansion 阶段：迁移到 Kubernetes，实现高可用

#### 下一步行动

1. **立即行动：**
   - 初始化项目（前端 + 后端）
   - 设置开发环境（Docker Compose）
   - 实现核心架构（分层架构、依赖注入）

2. **短期行动（1-2 个月）：**
   - 实现 MVP 功能
   - 添加单元测试
   - 实现 CI/CD 流程
   - 实现基础监控和告警

3. **中期行动（3-6 个月）：**
   - 迁移到 MinIO 对象存储
   - 实现 JWT 认证
   - 优化性能（缓存、索引）
   - 提高测试覆盖率

4. **长期行动（7-12 个月）：**
   - 迁移到 Kubernetes
   - 实现 CDN 加速
   - 实现读写分离
   - 实现完整的监控和告警系统

---

## 步骤8：架构文档总结

### 架构概览

MultiLanguageManager 采用**分层单体架构（Layered Monolith）**，使用 **Vite + Vue3** 作为前端框架，**Express + TypeScript** 作为后端框架，**PostgreSQL** 作为主数据库，**Redis** 作为缓存和任务队列。

**技术栈总结：**

| 层次 | 技术选型 | 用途 |
|------|---------|------|
| **前端** | Vite + Vue3 + TypeScript + Pinia | SPA 应用 |
| **后端** | Express + TypeScript + Prisma | RESTful API |
| **数据库** | PostgreSQL 14+ | 数据存储 |
| **缓存** | Redis 7+ | 缓存、任务队列、Pub/Sub |
| **任务队列** | Bull | 异步任务处理 |
| **对象存储** | 本地文件系统（MVP）→ MinIO（Growth）| 文件存储 |
| **API 文档** | Swagger/OpenAPI | API 文档 |
| **实时通信** | Socket.io | WebSocket 服务 |
| **日志** | Winston | 日志记录 |
| **认证** | JWT + API Key | 用户认证 |
| **加密** | BCrypt + AES-256 | 密码哈希、数据加密 |

**架构分层：**

```
┌─────────────────────────────────────────┐
│         Frontend (Vue3 SPA)            │
│    (Components, Pinia, Router)        │
├─────────────────────────────────────────┤
│         Presentation Layer              │
│   (Controllers, Routes, WebSockets)   │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│   (Services, Validators, Utils)        │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│       (Prisma ORM, Repository)         │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (Database, Redis, File Storage, Queue)│
└─────────────────────────────────────────┘
```

### 核心服务模块

| 服务模块 | 职责 | API 端点 | 依赖 |
|---------|------|---------|------|
| **用户认证服务** | 用户注册、登录、Token 生成 | POST /api/v1/auth/* | PostgreSQL, Redis |
| **项目管理服务** | 项目 CRUD、项目配置、权限控制 | GET/POST /api/v1/projects | PostgreSQL, Redis |
| **文案管理服务** | 文案 CRUD、UUID 生成、格式转换 | GET/POST /api/v1/projects/:projectId/translations | PostgreSQL, Redis |
| **Excel 处理服务** | Excel 上传、解析、批量导入 | POST /api/v1/projects/:projectId/upload | Bull Queue, File Storage |
| **文件生成服务** | 多语言文件生成、格式转换、ZIP 打包 | GET /api/v1/projects/:projectId/download | Redis, File Storage |
| **批量操作服务** | 批量导入、导出、更新、删除 | POST /api/v1/batch/* | Bull Queue, PostgreSQL |
| **API Key 管理服务** | API Key 生成、验证、速率限制 | GET/POST /api/v1/api-keys | PostgreSQL, Redis |
| **监控和日志服务** | 系统监控、日志收集、告警 | GET /api/v1/logs/* | Winston, Redis |
| **通知服务** | 邮件通知、Slack 通知、WebSocket 推送 | POST /api/v1/notifications | Socket.io, Nodemailer |
| **文档服务** | API 文档、FAQ、使用指南 | GET /api/v1/docs, GET /api/v1/templates/* | Swagger/OpenAPI, File Storage |

### 设计模式应用

**创建型模式：**
- 工厂模式（Factory Pattern）：文件格式转换器工厂、验证器工厂
- 单例模式（Singleton Pattern）：Redis 连接池、数据库连接池、Logger 实例
- 建造者模式（Builder Pattern）：查询构建器、API 响应构建器

**结构型模式：**
- 适配器模式（Adapter Pattern）：存储适配器、第三方服务适配器
- 装饰器模式（Decorator Pattern）：缓存装饰器、日志装饰器、认证装饰器
- 外观模式（Facade Pattern）：批量操作外观、Excel 处理外观、文件生成外观

**行为型模式：**
- 策略模式（Strategy Pattern）：认证策略、速率限制策略、文件转换策略
- 观察者模式（Observer Pattern）：WebSocket 事件监听、缓存失效事件
- 命令模式（Command Pattern）：Bull 队列任务、批量操作命令
- 模板方法模式（Template Method Pattern）：文件生成器模板、验证器模板

**架构模式：**
- MVC 模式（Model-View-Controller）：前后端 MVC 架构
- 仓库模式（Repository Pattern）：数据访问层封装
- 依赖注入（Dependency Injection）：Service 依赖注入
- 中间件模式（Middleware Pattern）：Express 中间件

**集成模式：**
- API 网关模式（API Gateway Pattern）：统一 API 入口
- 事件驱动架构（Event-Driven Architecture）：批量操作进度、缓存失效

**数据访问模式：**
- 工作单元模式（Unit of Work Pattern）：事务管理、批量操作

**并发模式：**
- 生产者-消费者模式（Producer-Consumer Pattern）：Bull 队列任务
- 发布-订阅模式（Pub/Sub Pattern）：Redis Pub/Sub

**安全模式：**
- 认证模式（Authentication Pattern）：API Key、JWT 认证
- 授权模式（Authorization Pattern）：RBAC、资源级权限
- 加密模式（Encryption Pattern）：API Key 加密、密码哈希

### 部署架构

**容器化部署（MVP）：**
- Docker + Docker Compose
- Nginx（Reverse Proxy）
- Vue3 SPA（Static Files）
- Express Backend（Node.js）
- PostgreSQL（Database）
- Redis（Cache/Queue）

**Kubernetes 部署（Post-MVP）：**
- Kubernetes 集群
- Ingress Controller
- Horizontal Pod Autoscaler（HPA）
- ConfigMap + Secret
- Persistent Volume（PV/PVC）

### 实施路线图

#### MVP 阶段（1-2 个月）

**目标：** 完成核心功能，验证产品价值

**功能列表：**
1. ✅ 用户认证和项目管理
2. ✅ Excel 上传和自动 key 生成
3. ✅ 三端格式转换（iOS、Android、Web）
4. ✅ 按需下载（API + 手动下载）
5. ✅ 项目基础管理

**技术目标：**
- 容器化部署（Docker + Docker Compose）
- 单元测试（覆盖率 > 60%）
- 基础监控（健康检查、日志记录）

**成功标准：**
- 至少两个项目成功使用
- 产品经理 10 分钟内完成 100 条文案上传
- 开发人员 30 秒内拉取三端语言包
- 系统可用性 ≥ 99%

#### Growth 阶段（3-6 个月）

**目标：** 增强产品功能，提高用户体验

**功能列表：**
1. 📝 Web 界面单条编辑
2. 🔍 文案搜索和筛选
3. 📜 变更历史和版本回滚
4. 📦 Excel 导入前预览
5. 🔄 批量操作（批量导入/导出/更新）
6. 📊 使用统计和分析
7. 🔐 API + 脚本支持（完整文档、脚本指南）
8. 🔑 API 认证和权限控制（JWT）
9. 🌐 项目列表 API 端点
10. ❌ 错误处理和结构化响应

**技术目标：**
- 迁移到 MinIO 对象存储
- 实现 JWT 认证
- 优化性能（缓存、索引）
- 提高测试覆盖率（> 80%）
- 实现 CI/CD 流程
- 实现监控和告警（Prometheus + Grafana）

**成功标准：**
- 产品经理满意度 ≥ 4.5/5
- 开发人员推荐意愿 ≥ 80%
- API 响应时间 < 10 秒（1000 条文案）
- Excel 解析成功率 ≥ 95%
- 文件格式转换准确性 ≥ 99.9%

#### Expansion 阶段（7-12 个月）

**目标：** 扩展平台功能，支持更多团队和平台

**功能列表：**
1. 🤖 智能重复文案检测
2. 📦 按需下载语言包
3. 🌐 支持更多平台格式（Flutter、React Native、Electron）
4. 👥 多租户和团队协作
5. 🔧 自动化测试和持续集成

**技术目标：**
- 迁移到 Kubernetes
- 实现 CDN 加速
- 实现读写分离
- 实现完整的监控和告警系统
- 实现链路追踪（Sentry/DataDog）

**成功标准：**
- 支持 10+ 项目
- 支持 30-50 并发用户
- 支持 10x 用户增长
- 多语言文案管理成为团队标准流程

### 参考资料

#### 技术文档
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Express 官方文档](https://expressjs.com/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Prisma 官方文档](https://www.prisma.io/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Redis 官方文档](https://redis.io/docs/)
- [Bull 官方文档](https://docs.bullmq.io/)
- [Socket.io 官方文档](https://socket.io/docs/)
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Kubernetes 官方文档](https://kubernetes.io/docs/)

#### 设计模式
- [设计模式：可复用面向对象软件的基础](https://refactoring.guru/design-patterns)
- [Node.js 设计模式](https://github.com/i0natan/node-patterns)
- [Express.js 最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html)

#### 架构模式
- [企业应用架构模式](https://www.enterpriseintegrationpatterns.com/)
- [微服务架构模式](https://microservices.io/patterns/)
- [事件驱动架构](https://martinfowler.com/articles/20170130/event-driven.html)

#### 安全最佳实践
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js 安全最佳实践](https://github.com/lirantal/awesome-nodejs-security)
- [Express 安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html)

#### 性能优化
- [Vue 3 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Node.js 性能优化](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PostgreSQL 性能优化](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis 性能优化](https://redis.io/docs/manual/patterns/)

#### 监控和日志
- [Winston 日志库](https://github.com/winstonjs/winston)
- [Prometheus 监控系统](https://prometheus.io/docs/)
- [Grafana 可视化平台](https://grafana.com/docs/)
- [Sentry 错误追踪](https://docs.sentry.io/)

### 附录

#### 术语表

| 术语 | 定义 |
|------|------|
| **MVP** | Minimum Viable Product，最小可行产品 |
| **SPA** | Single Page Application，单页应用 |
| **API** | Application Programming Interface，应用程序编程接口 |
| **ORM** | Object-Relational Mapping，对象关系映射 |
| **CRUD** | Create, Read, Update, Delete，增删改查 |
| **JWT** | JSON Web Token，JSON Web 令牌 |
| **RBAC** | Role-Based Access Control，基于角色的访问控制 |
| **CDN** | Content Delivery Network，内容分发网络 |
| **CI/CD** | Continuous Integration/Continuous Deployment，持续集成/持续部署 |
| **WebSocket** | 一种在单个 TCP 连接上进行全双工通信的协议 |
| **Pub/Sub** | Publish/Subscribe，发布/订阅模式 |
| **TTL** | Time To Live，生存时间 |
| **ADR** | Architecture Decision Record，架构决策记录 |

#### 缩写表

| 缩写 | 全称 |
|------|------|
| FR | Functional Requirement，功能需求 |
| NFR | Non-Functional Requirement，非功能需求 |
| API | Application Programming Interface，应用程序编程接口 |
| UI | User Interface，用户界面 |
| UX | User Experience，用户体验 |
| QA | Quality Assurance，质量保证 |
| KPI | Key Performance Indicator，关键绩效指标 |
| SLA | Service Level Agreement，服务级别协议 |
| HTTP | HyperText Transfer Protocol，超文本传输协议 |
| HTTPS | HTTP Secure，安全超文本传输协议 |
| JSON | JavaScript Object Notation，JavaScript 对象表示法 |
| XML | eXtensible Markup Language，可扩展标记语言 |
| SQL | Structured Query Language，结构化查询语言 |
| NoSQL | Not Only SQL，非关系型数据库 |
| ACID | Atomicity, Consistency, Isolation, Durability，原子性、一致性、隔离性、持久性 |
| CAP | Consistency, Availability, Partition tolerance，一致性、可用性、分区容错性 |

#### 联系方式

**项目团队：**
- **产品负责人：** hunter
- **架构负责人：** hunter
- **技术负责人：** 待定

**反馈渠道：**
- **Issues：** GitHub Issues
- **文档：** 项目 Wiki
- **邮件：** support@multilanguage.internal

---

## 架构文档版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| 1.0 | 2026-02-27 | hunter | 初始版本，完成所有架构决策 |

---

**✅ 架构决策文档完成！**

本文档定义了 MultiLanguageManager 项目的完整架构设计，包括：

- ✅ 项目上下文分析
- ✅ 技术栈选择（Vite + Vue3 + Express + TypeScript + PostgreSQL + Redis）
- ✅ 服务架构设计（分层单体架构，10 个核心服务模块）
- ✅ 部署架构设计（Docker + Docker Compose + Nginx）
- ✅ 架构模式设计（10+ 创建型/结构型/行为型模式，10+ 架构/集成/并发/安全模式）
- ✅ 架构验证（6 个 ADR、权衡分析、风险评估、技术债务管理、架构评审清单）
- ✅ 实施路线图（MVP/Growth/Expansion 三个阶段）
- ✅ 参考资料（技术文档、设计模式、架构模式、安全最佳实践、性能优化、监控和日志）
- ✅ 附录（术语表、缩写表、联系方式）
