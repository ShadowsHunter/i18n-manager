# Supabase 连接问题诊断和解决方案

## 问题症状

```
Supabase Error: {
  message: 'TypeError: fetch failed',
  details: 'Connect Timeout Error (UND_ERR_CONNECT_TIMEOUT)'
}
```

## 诊断结果

✅ **基本连接成功** - count 查询正常工作
❌ **复杂查询失败** - select 查询在获取实际数据时超时

## 可能的原因

### 1. 网络连接问题

- 防火墙阻止出站连接
- 公司/学校网络限制
- ISP 网络不稳定
- 代理配置问题

### 2. Supabase 服务问题

- 区域性服务中断
- 高延迟或拥塞
- DNS 解析问题

### 3. 配置问题

- 超时设置太短
- URL 配置错误
- 凭据权限不足

## 解决方案

### 方案 1: 检查网络连接

```bash
# 测试到 Supabase 的连接
ping ywybyfxgdacogqtmttet.supabase.co

# 使用 telnet 测试端口 443
telnet ywybyfxgdacogqtmttet.supabase.co 443
```

### 方案 2: 检查防火墙/代理设置

- 确保防火墙允许 HTTPS 出站连接（端口 443）
- 如果使用代理，配置 Node.js 使用代理：
  ```bash
  export HTTP_PROXY=http://proxy.example.com:8080
  export HTTPS_PROXY=http://proxy.example.com:8080
  npm run dev
  ```

### 方案 3: 增加超时时间 ✅ 已应用

```env
# .env
SUPABASE_TIMEOUT=60000  # 增加到 60 秒
SUPABASE_MAX_RETRIES=5   # 增加重试次数
```

### 方案 4: 使用本地开发模式（临时）

如果网络问题持续存在，可以临时使用 mock 数据：

1. 修改 `src/services/ProjectService.ts`，在方法开头添加：

```typescript
// 临时 mock 模式
if (process.env.USE_MOCK_DATA === 'true') {
  return mockGetProjects(filters);
}
```

2. 在 `.env` 中添加：

```env
USE_MOCK_DATA=true
```

### 方案 5: 联系 Supabase 支持

访问 https://supabase.com/support 检查服务状态

## 已应用的修复

### 1. 自定义 Fetch 实现

- ✅ 添加请求超时控制（默认 60 秒）
- ✅ 添加指数退避重试逻辑（最多 5 次重试）
- ✅ 详细的错误日志和诊断信息

### 2. 增强的错误处理

- ✅ 区分超时错误、连接错误和 HTTP 错误
- ✅ 提供清晰的错误消息和解决建议
- ✅ 详细的日志输出用于调试

### 3. 环境配置

- ✅ 增加超时时间到 60 秒
- ✅ 增加重试次数到 5 次
- ✅ 启动时显示 Supabase 配置

## 测试连接

运行连接测试脚本：

```bash
cd backend
npx ts-node test-supabase.ts
```

## 推荐的后续步骤

1. **短期解决**：使用 mock 模式继续开发
2. **中期解决**：与网络管理员沟通，检查防火墙设置
3. **长期解决**：考虑使用本地数据库或不同的云提供商

## 重新启动服务

应用更改后，重新启动后端服务：

```bash
cd backend
npm run dev
```

查看启动日志中的 Supabase 配置信息：

```
✅ Supabase client initialized
   URL: https://ywybyfxgdacogqtmttet.supabase.co
   Timeout: 60000ms
   Max Retries: 5
```

## 监控请求

如果仍然看到超时错误，查看日志中的重试信息：

```
⏱️  Supabase request timeout (attempt 1/6)
⏳  Retrying in 1000ms...
⏱️  Supabase request timeout (attempt 2/6)
⏳  Retrying in 2000ms...
...
```

这将帮助您了解是网络问题还是临时服务问题。
