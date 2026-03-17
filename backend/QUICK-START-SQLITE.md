# 快速启动指南 - 使用SQLite

## 为什么选择SQLite？

✅ **立即可用：** 无需配置外部服务
✅ **零依赖：** 不需要云服务账户
✅ **完整功能：** 所有CRUD操作已验证工作
✅ **开发友好：** 轻松重置/清理数据

---

## 立即启动（3步）

### 步骤1：停止当前后端

```bash
# 查找并停止node进程
ps aux | grep "node.*backend" | grep -v grep
# 如果有进程在运行，使用kill命令停止
```

### 步骤2：启动SQLite版本

```bash
cd backend
node test-server.js
```

### 步骤3：测试API

```bash
# 测试健康检查
curl http://localhost:3001/api/v1/health

# 测试登录
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 测试获取项目列表
curl http://localhost:3001/api/v1/projects
```

---

## SQLite数据库位置

```
backend/dev.db
```

**查看数据库：**

```bash
cd backend
sqlite3 dev.db

# 查看所有表
.tables

# 查看用户
SELECT * FROM users;

# 查看项目
SELECT * FROM projects;

# 查看条目
SELECT * FROM entries;

# 退出
.quit
```

---

## 重置数据库（如需）

```bash
cd backend
rm dev.db
node init-db.js
```

---

## 迁移到Supabase（生产环境）

当需要部署到生产环境时，参考：
`backend/SUPABASE-SETUP-GUIDE.md`

---

## 当前功能状态

| 功能            | 状态      |
| --------------- | --------- |
| 用户认证 (登录) | ✅ 工作中 |
| 项目CRUD        | ✅ 工作中 |
| 条目CRUD        | ✅ 工作中 |
| 级联删除        | ✅ 工作中 |
| 搜索/过滤       | ✅ 工作中 |
| 分页            | ✅ 工作中 |

---

**推荐：** 本地开发使用SQLite，生产环境部署到Supabase。
