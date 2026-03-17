# API 规范文档 (OpenAPI 3.0)

**项目：** MultiLanguageManager
**版本：** 1.0.0
**作者：** hunter
**日期：** 2026-02-27

---

## 概述

本文档定义 MultiLanguageManager 平台的 RESTful API 规范。API 遵循 OpenAPI 3.0 标准，支持 JSON 格式请求和响应。

---

## 基础信息

### Base URL
```
开发环境: https://api-dev.multilanguage.internal
生产环境: https://api.multilanguage.internal
```

### API 版本
```
当前版本: v1
版本路径: /api/v1
```

### 认证方式
```
方式: API Key 或 JWT Token
Header: Authorization
格式: Bearer {token} 或 ApiKey {key}
```

### 请求格式
```
Content-Type: application/json
Accept: application/json
```

### 速率限制
```
默认限制: 100 次/分钟
自定义限制: 根据用户角色和 API Key 配置
Header 信息:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1645900000
```

---

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

## 错误码定义

| 错误码 | HTTP 状态码 | 描述 |
|-------|-----------|------|
| UNAUTHORIZED | 401 | 未授权，缺少或无效的认证信息 |
| FORBIDDEN | 403 | 禁止访问，权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| DUPLICATE_KEY | 409 | 唯一键冲突 |
| RATE_LIMIT_EXCEEDED | 429 | 超过速率限制 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务暂时不可用 |

---

## API 端点列表

### 认证相关
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `POST /api/v1/auth/refresh` - 刷新 JWT Token

### 项目管理
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects/{id}` - 获取项目详情
- `PUT /api/v1/projects/{id}` - 更新项目
- `DELETE /api/v1/projects/{id}` - 删除项目

### 文案管理
- `GET /api/v1/projects/{projectId}/translations` - 获取文案列表
- `POST /api/v1/projects/{projectId}/translations` - 创建文案
- `GET /api/v1/projects/{projectId}/translations/{id}` - 获取文案详情
- `PUT /api/v1/projects/{projectId}/translations/{id}` - 更新文案
- `DELETE /api/v1/projects/{projectId}/translations/{id}` - 删除文案

### 文件上传
- `POST /api/v1/projects/{projectId}/upload` - 上传 Excel 文件
- `GET /api/v1/projects/{projectId}/upload/{uploadId}` - 获取上传状态
- `POST /api/v1/projects/{projectId}/upload/{uploadId}/preview` - 预览上传内容

### 文件下载
- `GET /api/v1/projects/{projectId}/download` - 下载多语言文件
- `GET /api/v1/projects/{projectId}/languages/{langCode}/platform/{platform}` - 下载指定平台和语言的文件

### 批量操作
- `POST /api/v1/batch/import` - 批量导入
- `POST /api/v1/batch/export` - 批量导出
- `POST /api/v1/batch/update` - 批量更新
- `GET /api/v1/batch/operations/{id}` - 获取批量操作状态

### API Key 管理
- `GET /api/v1/api-keys` - 获取 API Key 列表
- `POST /api/v1/api-keys` - 创建 API Key
- `DELETE /api/v1/api-keys/{id}` - 删除 API Key

### 日志和监控
- `GET /api/v1/logs/audit` - 获取审计日志
- `GET /api/v1/logs/upload` - 获取上传日志
- `GET /api/v1/logs/download` - 获取下载日志

---

## 详细 API 定义

### 1. 用户登录

**端点：** `POST /api/v1/auth/login`

**请求参数：**
```json
{
  "username": "zhangsan",
  "password": "password123"
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "role": "product_manager"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名或密码错误"
  }
}
```

---

### 2. 获取项目列表

**端点：** `GET /api/v1/projects`

**请求参数：**
- `page` (optional): 页码，默认 1
- `page_size` (optional): 每页数量，默认 20，最大 100
- `search` (optional): 搜索关键词（项目名称或描述）

**请求示例：**
```
GET /api/v1/projects?page=1&page_size=20&search=ecommerce
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "ecommerce-platform",
        "description": "电商平台多语言文案管理",
        "owner": {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "username": "zhangsan"
        },
        "supported_languages": ["CN", "DA", "DE", "EN", "ES", "FI", "FR", "IT", "NL", "NO", "PL", "SE"],
        "translation_count": 150,
        "created_at": "2026-02-27T10:00:00Z",
        "updated_at": "2026-02-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

---

### 3. 创建项目

**端点：** `POST /api/v1/projects`

**请求参数：**
```json
{
  "name": "ecommerce-platform",
  "description": "电商平台多语言文案管理",
  "supported_languages": ["CN", "DA", "DE", "EN", "ES", "FI", "FR", "IT", "NL", "NO", "PL", "SE"]
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "ecommerce-platform",
    "description": "电商平台多语言文案管理",
    "owner": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "username": "zhangsan"
    },
    "supported_languages": ["CN", "DA", "DE", "EN", "ES", "FI", "FR", "IT", "NL", "NO", "PL", "SE"],
    "translation_count": 0,
    "created_at": "2026-02-27T10:00:00Z",
    "updated_at": "2026-02-27T10:00:00Z"
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "项目名称已存在",
    "details": {
      "field": "name"
    }
  }
}
```

---

### 4. 上传 Excel 文件

**端点：** `POST /api/v1/projects/{projectId}/upload`

**Content-Type：** `multipart/form-data`

**请求参数：**
- `file`: Excel 文件（.xlsx 格式）
- `preview` (optional): 是否仅预览，默认 false

**请求示例：**
```
POST /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="translations.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

[文件内容]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="preview"

true
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "upload_id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "completed",
    "total_rows": 100,
    "new_rows": 30,
    "updated_rows": 50,
    "deleted_rows": 10,
    "skipped_rows": 10,
    "warnings": [
      {
        "row": 5,
        "column": "FI",
        "message": "芬兰语翻译为空，已跳过"
      }
    ],
    "processing_time_ms": 2500
  }
}
```

**预览模式响应：**
```json
{
  "success": true,
  "data": {
    "upload_id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "pending",
    "preview": {
      "total_rows": 100,
      "new_rows": 30,
      "updated_rows": 50,
      "deleted_rows": 10,
      "skipped_rows": 10,
      "items": [
        {
          "row": 1,
          "key_uuid": "550e8400-e29b-41d4-a716-446655440003",
          "text_cn": "确定",
          "text_en": "Confirm",
          "text_de": "Bestätigen",
          ...
        }
      ],
      "warnings": [
        {
          "row": 5,
          "column": "FI",
          "message": "芬兰语翻译为空"
        }
      ]
    }
  }
}
```

---

### 5. 下载多语言文件

**端点：** `GET /api/v1/projects/{projectId}/download`

**请求参数：**
- `platform` (optional): 平台（ios, android, web），默认全部
- `languages` (optional): 语言代码数组，默认全部支持的语言
- `format` (optional): 文件格式（zip, individual），默认 zip

**请求示例：**
```
GET /api/v1/projects/550e8400-e29b-41d4-a716-446655440000/download?platform=ios&languages=CN,EN&format=zip
```

**成功响应（ZIP 文件）：**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="ecommerce-platform-ios-20260227.zip"

[二进制 ZIP 文件]
```

**成功响应（JSON 格式）：**
```json
{
  "success": true,
  "data": {
    "download_url": "https://api.multilanguage.internal/downloads/ecommerce-platform-ios-20260227.zip",
    "expires_at": "2026-02-27T12:00:00Z",
    "file_size": 524288,
    "file_count": 2
  }
}
```

---

### 6. 下载指定平台和语言的文件

**端点：** `GET /api/v1/projects/{projectId}/languages/{langCode}/platform/{platform}`

**路径参数：**
- `projectId`: 项目 ID
- `langCode`: 语言代码（CN, DA, DE, EN, ES, FI, FR, IT, NL, NO, PL, SE）
- `platform`: 平台（ios, android, web）

**成功响应（iOS .strings 格式）：**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Localizable.strings"

/* iOS Strings File */
"550e8400-e29b-41d4-a716-446655440003" = "确定";
"550e8400-e29b-41d4-a716-446655440004" = "取消";
"550e8400-e29b-41d4-a716-446655440005" = "设置";
```

**成功响应（Android strings.xml 格式）：**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="550e8400_e29b_41d4_a716_446655440003">确定</string>
  <string name="550e8400_e29b_41d4_a716_446655440004">取消</string>
  <string name="550e8400_e29b_41d4_a716_446655440005">设置</string>
</resources>
```

**成功响应（Web JSON 格式）：**
```json
{
  "550e8400-e29b-41d4-a716-446655440003": "确定",
  "550e8400-e29b-41d4-a716-446655440004": "取消",
  "550e8400-e29b-41d4-a716-446655440005": "设置"
}
```

---

### 7. 批量导入

**端点：** `POST /api/v1/batch/import`

**请求参数：**
```json
{
  "projects": [
    {
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "file_name": "app-a-translations.xlsx"
    },
    {
      "project_id": "660e8400-e29b-41d4-a716-446655440001",
      "file_name": "app-b-translations.xlsx"
    }
  ],
  "confirm": false
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "operation_id": "770e8400-e29b-41d4-a716-446655440003",
    "status": "processing",
    "total_tasks": 2,
    "completed_tasks": 0,
    "failed_tasks": 0,
    "progress_percentage": 0,
    "projects": [
      {
        "project_id": "550e8400-e29b-41d4-a716-446655440000",
        "project_name": "App A",
        "status": "processing",
        "total_rows": 120,
        "new_rows": 30,
        "updated_rows": 50,
        "deleted_rows": 10
      },
      {
        "project_id": "660e8400-e29b-41d4-a716-446655440001",
        "project_name": "App B",
        "status": "pending",
        "total_rows": 150,
        "new_rows": 40,
        "updated_rows": 60,
        "deleted_rows": 15
      }
    ]
  }
}
```

---

### 8. 获取批量操作状态

**端点：** `GET /api/v1/batch/operations/{id}`

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "operation_type": "import",
    "status": "completed",
    "total_tasks": 2,
    "completed_tasks": 2,
    "failed_tasks": 0,
    "progress_percentage": 100,
    "projects": [
      {
        "project_id": "550e8400-e29b-41d4-a716-446655440000",
        "project_name": "App A",
        "status": "completed",
        "total_rows": 120,
        "new_rows": 30,
        "updated_rows": 50,
        "deleted_rows": 10
      },
      {
        "project_id": "660e8400-e29b-41d4-a716-446655440001",
        "project_name": "App B",
        "status": "completed",
        "total_rows": 150,
        "new_rows": 40,
        "updated_rows": 60,
        "deleted_rows": 15
      }
    ],
    "started_at": "2026-02-27T10:00:00Z",
    "completed_at": "2026-02-27T10:03:00Z",
    "processing_time_ms": 180000
  }
}
```

---

### 9. 创建 API Key

**端点：** `POST /api/v1/api-keys`

**请求参数：**
```json
{
  "name": "iOS App API Key",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "scopes": ["read", "write"],
  "rate_limit_per_minute": 100,
  "ip_whitelist": ["192.168.1.0/24"]
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "iOS App API Key",
    "api_key": "mlm_sk_12345678abcdefghijklmnopqrstuvwxyz12345678901234",  // 完整的 API Key，仅在创建时显示一次
    "key_prefix": "mlm_sk_12",  // 前 8 个字符，用于显示
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "scopes": ["read", "write"],
    "rate_limit_per_minute": 100,
    "ip_whitelist": ["192.168.1.0/24"],
    "is_active": true,
    "expires_at": null,
    "created_at": "2026-02-27T10:00:00Z"
  }
}
```

---

### 10. 获取审计日志

**端点：** `GET /api/v1/logs/audit`

**请求参数：**
- `page` (optional): 页码，默认 1
- `page_size` (optional): 每页数量，默认 20，最大 100
- `user_id` (optional): 用户 ID
- `action` (optional): 操作类型（create, update, delete, upload, download）
- `resource_type` (optional): 资源类型（project, translation, api_key）
- `start_date` (optional): 开始日期（ISO 8601 格式）
- `end_date` (optional): 结束日期（ISO 8601 格式）

**请求示例：**
```
GET /api/v1/logs/audit?page=1&page_size=20&action=upload&start_date=2026-02-01T00:00:00Z&end_date=2026-02-28T23:59:59Z
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440005",
        "user": {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "username": "zhangsan"
        },
        "action": "upload",
        "resource_type": "translation",
        "resource_id": "550e8400-e29b-41d4-a716-446655440000",
        "details": {
          "filename": "translations.xlsx",
          "total_rows": 100,
          "new_rows": 30,
          "updated_rows": 50
        },
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-02-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

## 文件格式规范

### iOS .strings 格式
```
/* Comment */
"key" = "value";

/* 带引号的字符串 */
"key_with_quote" = "Value with \"quote\"";

/* 多行字符串 */
"multiline_key" = "Line 1\nLine 2\nLine 3";
```

### Android strings.xml 格式
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <!-- Comment -->
  <string name="key">Value</string>

  <!-- 带引号的字符串 -->
  <string name="key_with_quote">Value with \"quote\"</string>

  <!-- 多行字符串 -->
  <string name="multiline_key">Line 1\nLine 2\nLine 3</string>
</resources>
```

### Web JSON 格式
```json
{
  "key": "Value",
  "key_with_quote": "Value with \"quote\"",
  "multiline_key": "Line 1\nLine 2\nLine 3"
}
```

---

## Excel 文件格式规范

### 标准模板结构

| Column A | Column B | Column C | Column D | ... | Column M |
|----------|----------|----------|----------|-----|----------|
| Key UUID | CN       | DA       | DE       | EN  | SE       |
| [自动生成] | 确定     | OK       | Bestätigen | Confirm | OK       |

### 规范要求
1. **文件格式：** 仅支持 `.xlsx` 格式（不支持 `.xls`）
2. **字符编码：** UTF-8
3. **第一行：** 表头，包含 Key UUID 和 12 种语言代码
4. **Key UUID 列：** 第一列，用于存储唯一标识（可留空，系统自动生成）
5. **语言列：** 12 种语言（CN, DA, DE, EN, ES, FI, FR, IT, NL, NO, PL, SE）
6. **空值处理：** 允许空值，系统将跳过对应语言的翻译
7. **特殊字符：** 支持所有 UTF-8 字符，包括 emoji 和特殊符号
8. **公式：** 不支持公式，需要将公式转换为静态值

### Excel 文件示例下载
```
GET /api/v1/templates/excel
```

---

## 版本控制

### API 版本策略
- 使用 URL 路径版本控制（`/api/v1/`）
- 主版本升级时创建新的路径（`/api/v2/`）
- 向后兼容的更改不增加版本号
- 向后不兼容的更改增加主版本号

### 弃用策略
- 弃用的端点在响应头中包含 `X-API-Deprecated: true`
- 弃用日期和移除日期在 API 文档中明确标注
- 弃用后至少保留 6 个月才移除

---

## 安全性

### 认证
- 支持 JWT Token 和 API Key 两种认证方式
- JWT Token 过期时间：1 小时
- API Key 永不过期（可设置过期时间）
- 刷新 Token 过期时间：7 天

### 授权
- 基于角色的访问控制（RBAC）
- 角色：product_manager, developer, admin, support
- 权限：
  - product_manager: 读写自己项目的文案
  - developer: 只读，通过 API Key 访问
  - admin: 读写所有项目
  - support: 只读，查询日志

### 速率限制
- 默认：100 次/分钟
- 可根据用户角色和 API Key 配置调整
- 超过限制返回 HTTP 429

### CORS
- 开发环境：允许所有来源
- 生产环境：仅允许公司内网域名

---

## OpenAPI 3.0 规范

完整的 OpenAPI 3.0 规范文件可在以下位置获取：
```
GET /api/v1/openapi.yaml
GET /api/v1/openapi.json
```

该文件可直接导入到 Swagger UI、Postman 等 API 测试工具中。

---

## 附录：平台和语言代码

### 平台代码
| 代码 | 描述 |
|------|------|
| ios   | iOS 平台（.strings 格式） |
| android | Android 平台（strings.xml 格式） |
| web   | Web 平台（JSON 格式） |

### 语言代码
| 代码 | 语言名称 |
|------|---------|
| CN   | 中文     |
| DA   | 丹麦语   |
| DE   | 德语     |
| EN   | 英语     |
| ES   | 西班牙语 |
| FI   | 芬兰语   |
| FR   | 法语     |
| IT   | 意大利语 |
| NL   | 荷兰语   |
| NO   | 挪威语   |
| PL   | 波兰语   |
| SE   | 瑞典语   |
