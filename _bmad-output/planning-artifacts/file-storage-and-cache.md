# 文件存储和缓存策略文档

**项目：** MultiLanguageManager
**版本：** 1.0
**作者：** hunter
**日期：** 2026-02-27

---

## 概述

本文档定义 MultiLanguageManager 平台的文件存储和缓存策略，包括文件命名规范、目录结构设计、版本管理策略和缓存策略。

---

## 文件存储架构

### 存储层级

```
MultiLanguageManager Platform
├── Database Layer (PostgreSQL)
│   └── Stores metadata and references
├── File Storage Layer (本地存储 / 云存储)
│   ├── Excel Upload Files
│   ├── Generated Translation Files
│   └── ZIP Archives
└── Cache Layer (Redis)
    └── Caches frequently accessed data
```

### 存储选型

**主存储：** 本地文件系统
- 适合 MVP 阶段
- 简单易维护
- 低成本

**备选存储：** 云存储（Post-MVP）
- AWS S3 / Alibaba OSS / Azure Blob Storage
- 支持 CDN 加速
- 支持对象生命周期管理

**缓存：** Redis
- 缓存生成的多语言文件
- 缓存用户权限和配置
- 会话存储

---

## 文件命名规范

### Excel 上传文件

**格式：** `{projectId}_{timestamp}_{random}.{ext}`

**示例：**
```
550e8400-e29b-41d4-a716-446655440000_20260227_100000_a1b2c3d4.xlsx
```

**组成部分：**
- `projectId`: 项目 ID
- `timestamp`: 时间戳（YYYYMMDD_HHMMSS）
- `random`: 8位随机字符（避免冲突）
- `ext`: 文件扩展名（.xlsx）

### 生成的多语言文件

**iOS .strings 文件：**
```
格式: {projectName}_{langCode}.strings
示例: ecommerce-platform_CN.strings
      ecommerce-platform_EN.strings
```

**Android strings.xml 文件：**
```
格式: values-{langCode}/strings.xml
目录结构:
  ├── values/strings.xml          (默认语言)
  ├── values-CN/strings.xml       (中文)
  ├── values-EN/strings.xml       (英语)
  └── values-DE/strings.xml       (德语)
```

**Web JSON 文件：**
```
格式: {langCode}.json
示例: CN.json
      EN.json
      DE.json
```

### ZIP 压缩包

**格式：** `{projectName}_{platform}_{timestamp}.zip`

**示例：**
```
ecommerce-platform-ios-20260227.zip
ecommerce-platform-android-20260227.zip
ecommerce-platform-web-20260227.zip
```

**内部结构示例（iOS）：**
```
ecommerce-platform-ios-20260227.zip
├── CN.strings
├── EN.strings
├── DE.strings
└── ...
```

---

## 目录结构设计

### 服务器端目录结构

```
/var/lib/multilanguage-manager/
├── uploads/                     # Excel 上传文件
│   ├── temp/                   # 临时文件（上传中）
│   │   └── {temp_id}.tmp
│   └── processed/              # 已处理的文件
│       └── {projectId}_{timestamp}_{random}.xlsx
├── generated/                   # 生成的多语言文件
│   ├── ios/
│   │   └── {projectId}/
│   │       ├── CN.strings
│   │       ├── EN.strings
│   │       └── ...
│   ├── android/
│   │   └── {projectId}/
│   │       ├── values-CN/strings.xml
│   │       ├── values-EN/strings.xml
│   │       └── ...
│   └── web/
│       └── {projectId}/
│           ├── CN.json
│           ├── EN.json
│           └── ...
├── archives/                   # ZIP 压缩包
│   └── {projectName}_{platform}_{timestamp}.zip
├── cache/                      # 文件缓存
│   ├── translations/            # 翻译文件缓存
│   ├── projects/               # 项目数据缓存
│   └── users/                  # 用户数据缓存
├── logs/                       # 日志文件
│   ├── application.log
│   ├── error.log
│   └── audit.log
├── backups/                    # 备份文件
│   ├── daily/                  # 每日备份
│   └── weekly/                 # 每周备份
└── templates/                  # Excel 模板
    └── standard_template.xlsx
```

### 客户端目录结构（推荐）

**iOS 项目：**
```
MyApp/
├── Resources/
│   └── Language/
│       ├── CN.strings
│       ├── EN.strings
│       └── DE.strings
```

**Android 项目：**
```
MyApp/
└── app/src/main/res/
    ├── values/strings.xml
    ├── values-CN/strings.xml
    ├── values-EN/strings.xml
    └── values-DE/strings.xml
```

**Web 项目：**
```
MyApp/
├── src/
│   ├── i18n/
│   │   ├── CN.json
│   │   ├── EN.json
│   │   └── DE.json
│   └── locales/
│       ├── CN/
│       ├── EN/
│       └── DE/
```

---

## 版本管理策略

### 文件版本标识

**版本号格式：** `{major}.{minor}.{patch}`

**示例：** `1.2.3`
- `major`: 重大更新（不兼容的更改）
- `minor`: 功能更新（向下兼容）
- `patch`: 错误修复（向下兼容）

### 版本存储

**数据库版本记录：**
```sql
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    language VARCHAR(5) NOT NULL,
    version VARCHAR(20) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    checksum TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**版本查询 API：**
```
GET /api/v1/projects/{projectId}/versions
GET /api/v1/projects/{projectId}/versions/{version}
```

### 版本回滚

**回滚 API：**
```
POST /api/v1/projects/{projectId}/rollback
Body:
{
  "version": "1.2.3"
}
```

---

## 缓存策略

### 缓存层次

```
L1: 内存缓存 (Application Level)
├── 热点数据缓存
└── 临时数据缓存

L2: Redis 缓存 (Distributed Level)
├── 翻译文件缓存
├── 用户权限缓存
└── 项目配置缓存

L3: 数据库缓存 (Database Level)
├── 查询结果缓存
└── 索引缓存
```

### 缓存键设计

**翻译文件缓存：**
```
格式: translations:{projectId}:{platform}:{langCode}
示例: translations:550e8400-e29b-41d4-a716-446655440000:ios:CN
TTL: 3600 秒（1 小时）
```

**项目数据缓存：**
```
格式: project:{projectId}
示例: project:550e8400-e29b-41d4-a716-446655440000
TTL: 300 秒（5 分钟）
```

**用户权限缓存：**
```
格式: user:permissions:{userId}
示例: user:permissions:660e8400-e29b-41d4-a716-446655440001
TTL: 600 秒（10 分钟）
```

### 缓存失效策略

**主动失效：**
- 文案更新时失效对应翻译文件缓存
- 项目配置更新时失效项目数据缓存
- 用户权限变更时失效用户权限缓存

**被动失效：**
- TTL 过期自动失效
- 内存不足时 LRU 淘汰

**批量失效：**
```
失效项目下所有缓存:
  FLUSHDB translations:{projectId}:*

失效用户所有缓存:
  FLUSHDB user:{userId}:*
```

### 缓存预热

**系统启动时预热：**
```javascript
async function warmupCache() {
    // 加载热门项目
    const popularProjects = await getPopularProjects(10);
    for (const project of popularProjects) {
        await cacheProject(project.id);
    }

    // 加载频繁访问的翻译文件
    const popularLanguages = ['CN', 'EN', 'DE'];
    for (const project of popularProjects) {
        for (const lang of popularLanguages) {
            await cacheTranslationFile(project.id, 'ios', lang);
            await cacheTranslationFile(project.id, 'android', lang);
            await cacheTranslationFile(project.id, 'web', lang);
        }
    }
}
```

---

## 文件生命周期管理

### 上传文件生命周期

```
1. 用户上传 Excel 文件
   └→ 存储到 uploads/temp/ (临时状态)

2. 系统解析 Excel 文件
   └→ 验证格式和内容

3. 解析成功
   └→ 移动到 uploads/processed/
   └→ 更新数据库记录

4. 解析失败
   └→ 删除临时文件

5. 文件过期（7 天）
   └→ 删除已处理的文件
```

### 生成文件生命周期

```
1. 生成多语言文件
   └→ 存储到 generated/{platform}/{projectId}/

2. 缓存文件到 Redis
   └→ 缓存键: translations:{projectId}:{platform}:{langCode}

3. 用户下载文件
   └→ 从缓存或磁盘读取

4. 文件更新（文案变更）
   └→ 重新生成文件
   └→ 失效缓存

5. 文件过期（30 天）
   └→ 删除旧版本文件
```

### 清理策略

**自动清理任务（Cron Job）：**
```bash
# 每天凌晨 3:00 清理过期文件
0 3 * * * /usr/bin/python3 /opt/multilanguage/scripts/cleanup.py
```

**清理规则：**
- 临时文件（uploads/temp/）：超过 1 小时未使用则删除
- 已处理的上传文件（uploads/processed/）：保留 7 天
- 生成的翻译文件（generated/）：保留最新版本 + 最近 5 个历史版本
- ZIP 压缩包（archives/）：保留 30 天
- 日志文件（logs/）：保留 7 天

---

## 文件访问控制

### 权限模型

**基于项目的访问控制：**
```
Product Manager: 读写自己项目的文件
Developer: 只读，通过 API Key 访问
Admin: 读写所有项目的文件
Support: 只读，查询日志
```

### 文件访问 API

**下载文件：**
```
GET /api/v1/files/{fileId}
Headers:
  Authorization: ApiKey {key}
```

**上传文件：**
```
POST /api/v1/projects/{projectId}/upload
Headers:
  Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### 防盗链

**Referer 检查：**
```javascript
// 仅允许内部域名访问
const allowedReferers = [
    'https://internal.company.com',
    'http://localhost:*'
];

if (!allowedReferers.some(referer => request.headers.referer?.startsWith(referer))) {
    return 403 Forbidden;
}
```

**签名 URL（云存储）：**
```javascript
// 生成带签名的下载 URL（有效期 10 分钟）
const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: 'multilanguage-manager',
    Key: filePath,
    Expires: 600 // 10 分钟
});
```

---

## 文件压缩和优化

### ZIP 压缩

**压缩参数：**
```javascript
{
    level: 6,  // 压缩级别（1-9，6 为平衡速度和压缩率）
    store: false  // 不存储原始文件
}
```

**预期压缩率：**
- 文本文件：60-70%
- XML/JSON 文件：50-60%

### 文件优化

**iOS .strings 优化：**
```
# 移除空行和注释
# 合并重复的 key
# 排序 key
```

**Android strings.xml 优化：**
```xml
<!-- 移除未使用的字符串 -->
<!-- 合并重复的字符串 -->
<!-- 使用 CDATA 包裹特殊字符 -->
```

**Web JSON 优化：**
```javascript
// 使用 minified JSON
JSON.stringify(data, null, 0);  // 无缩进

// 移除 null 值
const cleaned = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v != null)
);
```

---

## 文件传输优化

### 断点续传

**支持范围请求（Range Requests）：**
```http
GET /api/v1/files/{fileId}
Range: bytes=0-1023
```

**响应：**
```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/10240
Content-Length: 1024
```

### CDN 加速（Post-MVP）

**CDN 配置：**
```javascript
// 文件上传到 CDN
const cdnUrl = await uploadToCDN(filePath, {
    bucket: 'multilanguage-manager',
    cdn: 'cdn.multilanguage.internal',
    cacheControl: 'public, max-age=3600'
});

// 返回 CDN URL 供客户端下载
return { downloadUrl: cdnUrl };
```

**缓存策略：**
- HTML/JSON: 缓存 1 小时
- XML 文件: 缓存 1 小时
- ZIP 文件: 缓存 24 小时

---

## 监控和告警

### 存储监控

**关键指标：**
- 磁盘使用率
- 文件数量
- 平均文件大小
- 文件访问频率

**告警规则：**
- 磁盘使用率 > 80%: 警告
- 磁盘使用率 > 90%: 严重
- 文件数量异常增长: 警告

### 缓存监控

**关键指标：**
- 缓存命中率
- 缓存内存使用率
- 缓存键数量
- 平均响应时间

**告警规则：**
- 缓存命中率 < 70%: 警告
- 缓存内存使用率 > 80%: 严重

---

## 备份和恢复

### 备份策略

**文件系统备份：**
```bash
# 每日全量备份
rsync -avz /var/lib/multilanguage-manager/ /backup/multilanguage-manager/$(date +%Y%m%d)/

# 增量备份（基于 rsync --link-dest）
rsync -avz --link-dest=/backup/multilanguage-manager/yesterday/ \
    /var/lib/multilanguage-manager/ \
    /backup/multilanguage-manager/$(date +%Y%m%d)/
```

**云存储备份：**
```bash
# 同步到 S3
aws s3 sync /var/lib/multilanguage-manager/generated/ \
    s3://multilanguage-manager-backups/generated/ \
    --storage-class STANDARD_IA
```

### 恢复流程

1. 确认备份完整性
2. 选择要恢复的备份版本
3. 停止服务
4. 恢复文件
5. 恢复数据库
6. 重启服务
7. 验证数据

---

## 安全性

### 文件上传安全

**验证规则：**
- 文件类型：仅允许 .xlsx
- 文件大小：最大 50MB
- 文件内容：验证 Excel 格式
- 病毒扫描：集成 ClamAV

```javascript
function validateUpload(file) {
    // 验证文件类型
    if (!file.mimetype.includes('spreadsheet')) {
        throw new Error('Invalid file type');
    }

    // 验证文件大小
    if (file.size > 50 * 1024 * 1024) {
        throw new Error('File too large');
    }

    // 验证文件内容
    const workbook = XLSX.readFile(file.path);
    if (!workbook.Sheets) {
        throw new Error('Invalid Excel file');
    }

    // 病毒扫描
    const scanResult = await scanVirus(file.path);
    if (!scanResult.clean) {
        throw new Error('Virus detected');
    }
}
```

### 文件访问安全

**安全措施：**
- 所有文件通过 API 访问（禁止直接文件系统访问）
- 基于 Token 的认证
- IP 白名单
- HTTPS 加密传输

---

## 性能优化

### 文件读取优化

**使用内存映射（mmap）：**
```javascript
const fs = require('fs');
const file = fs.openSync(filePath, 'r');
const buffer = fs.mmapSync(null, fileSize, fs.PROT_READ, fs.MAP_SHARED, file.fd, 0);
```

**使用流式传输：**
```javascript
app.get('/download/:fileId', (req, res) => {
    const filePath = getFilePath(req.params.fileId);
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Length': stat.size
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});
```

### 缓存优化

**缓存压缩数据：**
```javascript
const zlib = require('zlib');
const compressed = zlib.gzipSync(JSON.stringify(data));
await redis.set(key, compressed);
```

**使用 Redis Pipeline：**
```javascript
const pipeline = redis.pipeline();
for (const item of items) {
    pipeline.set(item.key, item.value);
}
await pipeline.exec();
```

---

## 附录：配置示例

### Redis 配置
```ini
# /etc/redis/redis.conf

# 最大内存
maxmemory 2gb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 持久化
save 900 1
save 300 10
save 60 10000

# RDB 文件
dir /var/lib/redis
dbfilename dump.rdb
```

### Nginx 配置（文件服务器）
```nginx
server {
    listen 80;
    server_name files.multilanguage.internal;

    location /downloads/ {
        alias /var/lib/multilanguage-manager/archives/;
        autoindex off;

        # 安全：禁止执行脚本
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # 限制访问速率
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_req zone=one burst=20 nodelay;

    # 防盗链
    valid_referers none blocked internal.company.com;
    if ($invalid_referer) {
        return 403;
    }
}
```
