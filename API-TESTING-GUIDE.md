# API端点测试说明

## 步骤 1: 启动后端服务器

**Windows (双击运行):**

```
start-backend.bat
```

**或者使用命令行:**

```bash
cd backend
npm run dev
```

**或者使用简单的测试服务器:**

```bash
cd backend
node test-server.js
```

服务器将在 http://localhost:3001 启动。

## 步骤 2: 测试API端点

**方式 1: 使用Node.js测试脚本**

```bash
cd backend
node test-api-endpoints.js
```

**方式 2: 使用curl命令**

### 1. 健康检查

```bash
curl http://localhost:3001/api/v1/health
```

### 2. 用户登录

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"
```

保存返回的token，用于后续请求。

### 3. 获取项目列表

```bash
curl http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. 获取条目列表

```bash
curl http://localhost:3001/api/v1/projects/PROJECT_ID/entries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. 获取API密钥列表

```bash
curl http://localhost:3001/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 测试凭据

- **Email:** admin@example.com
- **Password:** password123
- **Server:** http://localhost:3001

## 预期结果

所有端点应该返回200状态码和正确的JSON响应。

## 故障排除

### 问题: 端口被占用

**解决方案:** 修改 `backend/.env` 文件中的 `PORT` 值，或者关闭占用3001端口的进程。

### 问题: 数据库连接失败

**解决方案:** 确保数据库文件 `backend/dev.db` 存在，或者运行 `node init-db.js` 重新初始化数据库。

### 问题: 认证失败

**解决方案:** 确保使用正确的凭据（admin@example.com / password123），并检查token是否正确传递。
