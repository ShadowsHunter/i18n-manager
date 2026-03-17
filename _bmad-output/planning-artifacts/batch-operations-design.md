# 批量操作详细设计文档

**项目：** MultiLanguageManager
**版本：** 1.0
**作者：** hunter
**日期：** 2026-02-27

---

## 概述

本文档定义 MultiLanguageManager 平台的批量操作详细设计，包括批量导入、批量导出、批量更新、批量删除等功能的设计细节，确保数据一致性、性能优化和用户体验。

---

## 批量操作架构

### 操作流程

```
用户请求 → 验证和预处理 → 任务队列 → 并发执行 → 事务处理 → 结果汇总 → 通知用户
```

### 组件设计

```
BatchOperationController
    ↓
BatchOperationService
    ├── TaskQueue
    ├── ExecutorPool
    ├── TransactionManager
    └── ResultAggregator
```

---

## 批量导入设计

### 功能描述

支持同时上传多个 Excel 文件到多个项目，自动匹配文件名和项目，提供预览和确认功能。

### 批量大小限制

**默认限制：**
- 最大文件数量：10 个文件
- 单个文件大小：50MB
- 总大小限制：500MB
- 单次导入最大行数：10,000 行

**配置化：**
```javascript
const BATCH_IMPORT_LIMITS = {
    maxFiles: 10,
    maxFileSize: 50 * 1024 * 1024,  // 50MB
    maxTotalSize: 500 * 1024 * 1024,  // 500MB
    maxRowsPerFile: 10000
};
```

### 并发控制

**并发策略：**
- 默认并发数：3 个文件同时处理
- 可配置并发数：1-10
- 使用信号量（Semaphore）控制并发

**实现：**
```javascript
const { Semaphore } = require('semaphore');
const concurrentLimit = 3;
const semaphore = new Semaphore(concurrentLimit);

async function processFiles(files) {
    const results = await Promise.all(
        files.map(file => semaphore.use(() => processFile(file)))
    );
    return results;
}
```

### 超时处理

**超时配置：**
- 单个文件处理超时：5 分钟
- 整个批量操作超时：30 分钟

**实现：**
```javascript
async function processFileWithTimeout(file, timeoutMs = 5 * 60 * 1000) {
    return Promise.race([
        processFile(file),
        timeout(timeoutMs, 'File processing timeout')
    ]);
}
```

### 失败处理

**失败策略：**
- 单个文件失败不影响其他文件
- 记录失败原因
- 继续处理剩余文件

**实现：**
```javascript
async function processFiles(files) {
    const results = [];
    for (const file of files) {
        try {
            const result = await processFile(file);
            results.push({ file, status: 'success', result });
        } catch (error) {
            results.push({
                file,
                status: 'failed',
                error: error.message,
                details: error.stack
            });
        }
    }
    return results;
}
```

### 事务处理

**事务范围：**
- 每个文件的导入在独立事务中
- 单个文件失败不影响其他文件

**实现：**
```javascript
async function importFile(file, projectId) {
    return await transaction(async (trx) => {
        // 验证 Excel 格式
        const workbook = validateExcel(file);

        // 解析数据
        const data = parseExcel(workbook);

        // 批量插入数据库
        await batchInsertTranslations(trx, projectId, data);

        // 记录日志
        await logImport(trx, projectId, file, data);

        return { success: true, rows: data.length };
    });
}
```

### 进度跟踪

**进度计算：**
```
进度百分比 = (已完成文件数 / 总文件数) * 100%
```

**WebSocket 推送：**
```javascript
// 服务器端推送进度
io.to(operationId).emit('progress', {
    operationId,
    totalTasks: 10,
    completedTasks: 7,
    failedTasks: 1,
    progressPercentage: 70
});
```

### 客户端集成

**前端实现：**
```javascript
// 上传多个文件
const formData = new FormData();
files.forEach(file => {
    formData.append('files', file);
});

const response = await fetch('/api/v1/batch/import', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: formData
});

const { operationId } = await response.json();

// 监听进度
const socket = io('/batch-operations');
socket.emit('join', operationId);

socket.on('progress', (data) => {
    updateProgress(data.progressPercentage);
});

socket.on('completed', (result) => {
    showResult(result);
});
```

---

## 批量导出设计

### 功能描述

支持按项目、平台、语言批量导出多语言文件，生成 ZIP 压缩包或单独下载。

### 批量大小限制

**默认限制：**
- 最大项目数量：10 个项目
- 最大文件数量：108 个（10 项目 × 3 平台 × 12 语言）
- 总大小限制：1GB
- 生成超时：10 分钟

### 并发生成

**并发策略：**
- 默认并发数：5 个文件同时生成
- 按平台分组生成（优化性能）

**实现：**
```javascript
async function generateFiles(projects, platforms, languages) {
    const tasks = [];

    // 按平台分组
    for (const platform of platforms) {
        for (const project of projects) {
            for (const language of languages) {
                tasks.push({
                    projectId: project.id,
                    platform,
                    language
                });
            }
        }
    }

    // 并发生成
    const results = await Promise.all(
        chunk(tasks, 5).map(batch =>
            Promise.all(batch.map(task => generateFile(task)))
        )
    );

    return results.flat();
}
```

### ZIP 打包

**打包策略：**
- 使用流式打包（避免内存溢出）
- 文件按目录组织

**实现：**
```javascript
const archiver = require('archiver');

async function createZip(files) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream('output.zip');
        const archive = archiver('zip', {
            zlib: { level: 6 }
        });

        output.on('close', () => resolve());
        archive.on('error', reject);

        archive.pipe(output);

        files.forEach(file => {
            archive.file(file.path, { name: file.name });
        });

        archive.finalize();
    });
}
```

### 缓存优化

**缓存策略：**
- 生成的文件缓存 1 小时
- 重复请求直接返回缓存

**实现：**
```javascript
async function getCachedOrGenerate(task) {
    const cacheKey = `generated:${task.projectId}:${task.platform}:${task.language}`;

    // 检查缓存
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    // 生成文件
    const file = await generateFile(task);

    // 缓存文件
    await redis.setex(cacheKey, 3600, JSON.stringify(file));

    return file;
}
```

---

## 批量更新设计

### 功能描述

支持批量更新多个项目中的共享文案，使用事务确保数据一致性，支持智能匹配和批量替换。

### 智能匹配

**匹配策略：**
1. 精确匹配：完全相同的文案
2. 模糊匹配：相似度 > 80% 的文案
3. 手动匹配：用户手动选择匹配项

**实现：**
```javascript
const similarity = require('string-similarity');

function findMatches(searchText, translations, threshold = 0.8) {
    const matches = [];

    for (const translation of translations) {
        // 检查所有语言的文本
        for (const lang of ['CN', 'EN', 'DE', ...]) {
            const text = translation[`text_${lang.toLowerCase()}`];
            if (text) {
                const score = similarity.compareTwoStrings(searchText, text);
                if (score >= threshold) {
                    matches.push({
                        translation,
                        language: lang,
                        score
                    });
                }
            }
        }
    }

    // 按相似度排序
    return matches.sort((a, b) => b.score - a.score);
}
```

### 事务处理

**事务范围：**
- 整个批量更新在一个事务中
- 任何步骤失败全部回滚

**实现：**
```javascript
async function batchUpdate(updates) {
    return await transaction(async (trx) => {
        const results = [];

        for (const update of updates) {
            // 查找匹配的文案
            const matches = await findMatches(
                update.searchText,
                translations,
                trx
            );

            // 更新匹配的文案
            for (const match of matches) {
                await updateTranslation(trx, match.translation.id, update.newValues);
                results.push(match);
            }
        }

        return results;
    });
}
```

### 冲突解决

**冲突类型：**
1. 并发更新冲突
2. 数据格式冲突
3. 权限冲突

**解决策略：**
- 乐观锁：使用版本号检测冲突
- 自动重试：检测到冲突自动重试 3 次
- 人工干预：无法自动解决的冲突提示用户

**实现：**
```javascript
async function updateWithRetry(translationId, newData, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // 获取当前版本
            const current = await getTranslation(translationId);

            // 检查版本号
            if (current.version !== newData.version) {
                throw new Error('Version conflict');
            }

            // 更新数据
            const result = await updateTranslation(translationId, {
                ...newData,
                version: current.version + 1
            });

            return result;
        } catch (error) {
            if (error.message === 'Version conflict') {
                // 重试
                continue;
            }
            throw error;
        }
    }

    throw new Error('Max retries exceeded');
}
```

---

## 批量删除设计

### 功能描述

支持批量删除多条文案，支持按项目、语言、时间范围筛选，提供预览和确认功能。

### 删除验证

**验证规则：**
1. 检查权限（是否有删除权限）
2. 检查引用（是否有其他地方使用）
3. 检查约束（是否违反数据库约束）

**实现：**
```javascript
async function validateDeletions(translations) {
    const results = [];

    for (const translation of translations) {
        const issues = [];

        // 检查权限
        if (!hasPermissionToDelete(translation)) {
            issues.push('Permission denied');
        }

        // 检查引用
        const references = await findReferences(translation.id);
        if (references.length > 0) {
            issues.push(`Used in ${references.length} places`);
        }

        results.push({
            translation,
            canDelete: issues.length === 0,
            issues
        });
    }

    return results;
}
```

### 软删除

**实现：**
```javascript
async function softDelete(translations) {
    return await transaction(async (trx) => {
        const deleted = [];

        for (const translation of translations) {
            await trx('translations')
                .where({ id: translation.id })
                .update({
                    deleted_at: new Date(),
                    deleted_by: userId
                });

            deleted.push(translation);
        }

        return deleted;
    });
}
```

---

## 批量操作管理

### 操作状态机

```
pending → processing → completed
                    ↘ failed
                    ↘ cancelled
```

**状态定义：**
- `pending`: 等待处理
- `processing`: 正在处理
- `completed`: 处理完成
- `failed`: 处理失败
- `cancelled`: 已取消

### 任务队列

**队列实现：**
```javascript
const { Queue } = require('bullmq');
const queue = new Queue('batch-operations', {
    connection: redis
});

// 添加任务
await queue.add('batch-import', {
    operationId: 'xxx',
    files: [...]
}, {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000
    }
});

// 处理任务
const worker = new Worker('batch-operations', async (job) => {
    return await processBatchOperation(job.data);
}, {
    connection: redis
});
```

### 任务取消

**取消实现：**
```javascript
async function cancelOperation(operationId) {
    // 更新操作状态
    await db('batch_operations')
        .where({ id: operationId })
        .update({ status: 'cancelled' });

    // 取消队列中的任务
    const job = await queue.getJob(operationId);
    if (job) {
        await job.remove();
    }

    // 通知客户端
    io.to(operationId).emit('cancelled');
}
```

---

## 错误处理

### 错误分类

**错误类型：**
1. **验证错误：** 输入数据不符合要求
2. **业务错误：** 业务逻辑失败（如权限不足）
3. **系统错误：** 系统异常（如数据库连接失败）

### 错误响应

**统一格式：**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {
      "field": "具体字段",
      "value": "错误值"
    }
  }
}
```

### 重试机制

**重试策略：**
- 网络错误：自动重试 3 次
- 超时错误：自动重试 1 次
- 业务错误：不重试

**实现：**
```javascript
async function retryableOperation(fn, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (isNetworkError(error) && attempt < maxRetries - 1) {
                await sleep(2000 * (attempt + 1));  // 指数退避
                continue;
            }
            throw error;
        }
    }
}
```

---

## 监控和日志

### 操作日志

**日志格式：**
```json
{
  "timestamp": "2026-02-27T10:00:00Z",
  "operationId": "550e8400-e29b-41d4-a716-446655440000",
  "operationType": "import",
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "status": "completed",
  "details": {
    "totalTasks": 10,
    "completedTasks": 10,
    "failedTasks": 0,
    "processingTimeMs": 150000
  }
}
```

### 性能监控

**关键指标：**
- 操作成功率
- 平均处理时间
- P95 处理时间
- 并发操作数量

**告警规则：**
- 失败率 > 10%: 警告
- 平均处理时间 > 5 分钟: 警告
- 并发操作数 > 20: 严重

---

## 安全性

### 权限控制

**权限检查：**
```javascript
async function checkPermissions(operation, user) {
    switch (operation.type) {
        case 'import':
            return user.role === 'product_manager' || user.role === 'admin';
        case 'export':
            return user.role === 'developer' || user.role === 'product_manager' || user.role === 'admin';
        case 'update':
            return user.role === 'product_manager' || user.role === 'admin';
        case 'delete':
            return user.role === 'admin';
        default:
            return false;
    }
}
```

### 数据验证

**输入验证：**
```javascript
function validateBatchImportRequest(request) {
    const errors = [];

    if (!request.files || request.files.length === 0) {
        errors.push('No files provided');
    }

    if (request.files.length > 10) {
        errors.push('Too many files (max 10)');
    }

    request.files.forEach((file, index) => {
        if (file.size > 50 * 1024 * 1024) {
            errors.push(`File ${index + 1} too large (max 50MB)`);
        }

        if (!file.mimetype.includes('spreadsheet')) {
            errors.push(`File ${index + 1} invalid type`);
        }
    });

    return errors;
}
```

---

## 性能优化

### 批处理

**数据库批处理：**
```javascript
// 使用批处理插入
await trx('translations').insert([
    { id: '...', text_cn: '...', text_en: '...' },
    { id: '...', text_cn: '...', text_en: '...' },
    ...
]);

// 而不是循环插入
for (const item of items) {
    await trx('translations').insert(item);  // 慢
}
```

### 流式处理

**流式上传：**
```javascript
app.post('/batch/import', upload.array('files', 10), async (req, res) => {
    const operationId = uuidv4();

    // 创建操作记录
    await db('batch_operations').insert({
        id: operationId,
        status: 'processing',
        total_tasks: req.files.length
    });

    // 异步处理
    processBatchOperation(operationId, req.files)
        .then(result => {
            io.to(operationId).emit('completed', result);
        })
        .catch(error => {
            io.to(operationId).emit('failed', error);
        });

    // 立即返回操作 ID
    res.json({ operationId });
});
```

### 连接池

**数据库连接池：**
```javascript
const pool = new Pool({
    host: 'localhost',
    database: 'multilanguage_manager',
    max: 20,  // 最大连接数
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
```

---

## 附录：批量操作 API

### 批量导入 API

```
POST /api/v1/batch/import
Content-Type: multipart/form-data

Files: files[] (Excel files)
Body:
{
  "projects": [
    { "projectId": "xxx", "fileName": "app-a.xlsx" },
    { "projectId": "yyy", "fileName": "app-b.xlsx" }
  ],
  "confirm": false
}

Response:
{
  "operationId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "estimatedTimeSeconds": 300
}
```

### 批量导出 API

```
POST /api/v1/batch/export
Content-Type: application/json

Body:
{
  "projectIds": ["xxx", "yyy"],
  "platforms": ["ios", "android", "web"],
  "languages": ["CN", "EN", "DE"],
  "format": "zip"
}

Response:
{
  "operationId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "downloadUrl": "/api/v1/downloads/xxx.zip"
}
```

### 批量更新 API

```
POST /api/v1/batch/update
Content-Type: application/json

Body:
{
  "projectIds": ["xxx", "yyy"],
  "updates": [
    {
      "searchText": "确定",
      "newValues": { "text_en": "OK" }
    }
  ]
}

Response:
{
  "operationId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "matchCount": 40
}
```

### 获取操作状态 API

```
GET /api/v1/batch/operations/{id}

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "operationType": "import",
  "status": "completed",
  "totalTasks": 10,
  "completedTasks": 10,
  "failedTasks": 0,
  "progressPercentage": 100,
  "results": [...],
  "startedAt": "2026-02-27T10:00:00Z",
  "completedAt": "2026-02-27T10:05:00Z",
  "processingTimeMs": 300000
}
```

### 取消操作 API

```
DELETE /api/v1/batch/operations/{id}

Response:
{
  "success": true,
  "message": "Operation cancelled"
}
```
