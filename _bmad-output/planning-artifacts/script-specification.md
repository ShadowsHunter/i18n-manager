# 脚本开发规范文档

**项目：** MultiLanguageManager
**版本：** 1.0
**作者：** hunter
**日期：** 2026-02-27

---

## 概述

本文档定义 MultiLanguageManager 平台的脚本开发规范，包括命令行接口、配置文件格式、错误处理标准和集成示例。脚本支持三种平台：Android（Groovy/Gradle）、iOS（Shell）、Web（Node.js/npm）。

---

## 通用规范

### 命名规范
- 脚本文件名：`mlm-sync.{ext}`（如 `mlm-sync.sh`, `mlm-sync.groovy`）
- 配置文件名：`mlm.config.json`
- 日志文件名：`mlm-sync.log`

### 目录结构
```
project-root/
├── mlm-sync.sh           # iOS 脚本
├── mlm-sync.groovy       # Android 脚本
├── mlm-sync.js           # Web 脚本
├── mlm.config.json       # 配置文件
├── .mlm/                 # MLM 缓存目录
│   ├── cache/            # 缓存文件
│   └── logs/             # 日志文件
└── .gitignore            # 忽略 MLM 缓存文件
```

### 配置文件格式

**mlm.config.json**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "apiKey": "mlm_sk_12345678abcdefghijklmnopqrstuvwxyz12345678901234",
  "platform": "ios",
  "languages": ["CN", "EN", "DE"],
  "outputPath": "./Resources/Language",
  "apiUrl": "https://api.multilanguage.internal/api/v1",
  "timeout": 30,
  "retries": 3,
  "verbose": false
}
```

**配置说明：**
- `projectId`: 项目 ID（必填）
- `apiKey`: API Key（必填）
- `platform`: 平台（ios, android, web）
- `languages`: 语言代码数组（默认全部支持的语言）
- `outputPath`: 输出路径（必填）
- `apiUrl`: API 基础 URL（默认官方地址）
- `timeout`: 请求超时时间（秒，默认 30）
- `retries`: 失败重试次数（默认 3）
- `verbose`: 详细输出（默认 false）

---

## iOS 脚本规范（Shell）

### 脚本文件名
- 主脚本：`mlm-sync.sh`
- 可执行权限：`chmod +x mlm-sync.sh`

### 命令行接口

**基本用法：**
```bash
./mlm-sync.sh [options]
```

**命令行参数：**
```bash
-p, --project-id <id>         项目 ID
-k, --api-key <key>           API Key
-o, --output <path>           输出路径
-l, --languages <codes>       语言代码（逗号分隔）
-u, --api-url <url>           API 基础 URL
-t, --timeout <seconds>       请求超时时间
-r, --retries <number>        失败重试次数
-v, --verbose                 详细输出
-h, --help                    显示帮助
-c, --config <file>           指定配置文件
--init                        初始化配置文件
--dry-run                     预演模式，不实际下载
```

**示例：**
```bash
# 使用命令行参数
./mlm-sync.sh -p "550e8400-e29b-41d4-a716-446655440000" -k "mlm_sk_..." -o "./Resources/Language"

# 使用配置文件
./mlm-sync.sh -c mlm.config.json

# 预演模式
./mlm-sync.sh --dry-run

# 详细输出
./mlm-sync.sh -v
```

### Xcode Build Phase 集成

**脚本路径：** 项目根目录 `/mlm-sync.sh`

**Build Phase 配置：**
1. 在 Xcode 中打开项目
2. 选择 Target → Build Phases
3. 点击 "+" → "New Run Script Phase"
4. 将脚本拖拽到 "Compile Sources" 之前
5. 添加以下内容：

```bash
#!/bin/bash

# MultiLanguageManager Sync Script
cd "${PROJECT_DIR}"
./mlm-sync.sh -c mlm.config.json

if [ $? -ne 0 ]; then
    echo "❌ MultiLanguageManager sync failed"
    exit 1
fi

echo "✅ MultiLanguageManager sync completed"
```

### 错误处理

**错误码定义：**
| 错误码 | 描述 |
|-------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 2 | 配置文件不存在 |
| 3 | API 请求失败 |
| 4 | 文件下载失败 |
| 5 | 文件解压失败 |

**错误输出格式：**
```bash
echo "❌ Error: ${error_message}" >&2
echo "Error Code: ${error_code}" >&2
exit ${error_code}
```

### 完整脚本示例

```bash
#!/bin/bash

# MultiLanguageManager Sync Script for iOS
# Version: 1.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认配置
PROJECT_ID=""
API_KEY=""
OUTPUT_PATH="./Resources/Language"
LANGUAGES=""
API_URL="https://api.multilanguage.internal/api/v1"
TIMEOUT=30
RETRIES=3
VERBOSE=false
DRY_RUN=false
CONFIG_FILE=""

# 帮助信息
show_help() {
    cat << EOF
MultiLanguageManager Sync Script for iOS

Usage: $0 [options]

Options:
  -p, --project-id <id>         Project ID
  -k, --api-key <key>           API Key
  -o, --output <path>           Output path
  -l, --languages <codes>       Language codes (comma-separated)
  -u, --api-url <url>           API base URL
  -t, --timeout <seconds>       Request timeout (default: 30)
  -r, --retries <number>        Retries on failure (default: 3)
  -v, --verbose                 Verbose output
  -h, --help                    Show this help
  -c, --config <file>           Use config file
  --init                        Initialize config file
  --dry-run                     Dry run, don't actually download

Example:
  $0 -p "550e8400-e29b-41d4-a716-446655440000" -k "mlm_sk_..." -o "./Resources/Language"
  $0 -c mlm.config.json
EOF
}

# 初始化配置文件
init_config() {
    cat << EOF > mlm.config.json
{
  "projectId": "",
  "apiKey": "",
  "platform": "ios",
  "languages": ["CN", "EN", "DE"],
  "outputPath": "./Resources/Language",
  "apiUrl": "https://api.multilanguage.internal/api/v1",
  "timeout": 30,
  "retries": 3,
  "verbose": false
}
EOF
    echo -e "${GREEN}✅ Config file created: mlm.config.json${NC}"
    echo -e "${YELLOW}⚠️  Please edit mlm.config.json and fill in projectId and apiKey${NC}"
    exit 0
}

# 加载配置文件
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Config file not found: $CONFIG_FILE${NC}" >&2
        exit 2
    fi

    PROJECT_ID=$(jq -r '.projectId' "$CONFIG_FILE")
    API_KEY=$(jq -r '.apiKey' "$CONFIG_FILE")
    OUTPUT_PATH=$(jq -r '.outputPath' "$CONFIG_FILE")
    LANGUAGES=$(jq -r '.languages | join(",")' "$CONFIG_FILE")
    API_URL=$(jq -r '.apiUrl' "$CONFIG_FILE")
    TIMEOUT=$(jq -r '.timeout' "$CONFIG_FILE")
    RETRIES=$(jq -r '.retries' "$CONFIG_FILE")
    VERBOSE=$(jq -r '.verbose' "$CONFIG_FILE")
}

# 下载文件
download_file() {
    local url=$1
    local output=$2

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}⚠️  Dry run: would download $url to $output${NC}"
        return 0
    fi

    local retry=0
    while [ $retry -lt $RETRIES ]; do
        if curl -s -S -o "$output" -w "%{http_code}" \
            -H "Authorization: ApiKey $API_KEY" \
            --connect-timeout "$TIMEOUT" \
            "$url" | grep -q "200"; then
            return 0
        else
            retry=$((retry + 1))
            if [ $retry -lt $RETRIES ]; then
                sleep 1
            fi
        fi
    done

    return 1
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--project-id)
                PROJECT_ID="$2"
                shift 2
                ;;
            -k|--api-key)
                API_KEY="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_PATH="$2"
                shift 2
                ;;
            -l|--languages)
                LANGUAGES="$2"
                shift 2
                ;;
            -u|--api-url)
                API_URL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -r|--retries)
                RETRIES="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                load_config
                shift 2
                ;;
            --init)
                init_config
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                echo -e "${RED}❌ Unknown option: $1${NC}" >&2
                show_help
                exit 1
                ;;
        esac
    done

    # 验证必填参数
    if [ -z "$PROJECT_ID" ] || [ -z "$API_KEY" ] || [ -z "$OUTPUT_PATH" ]; then
        echo -e "${RED}❌ Missing required parameters${NC}" >&2
        echo -e "${YELLOW}Use --init to create a config file or provide -p, -k, -o options${NC}" >&2
        exit 1
    fi

    # 显示配置
    if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}✅ Configuration:${NC}"
        echo "  Project ID: $PROJECT_ID"
        echo "  API URL: $API_URL"
        echo "  Output Path: $OUTPUT_PATH"
        echo "  Languages: ${LANGUAGES:-All}"
        echo "  Timeout: ${TIMEOUT}s"
        echo "  Retries: $RETRIES"
        echo "  Dry Run: $DRY_RUN"
        echo ""
    fi

    # 构建下载 URL
    if [ -n "$LANGUAGES" ]; then
        URL="${API_URL}/projects/${PROJECT_ID}/download?platform=ios&languages=${LANGUAGES}"
    else
        URL="${API_URL}/projects/${PROJECT_ID}/download?platform=ios"
    fi

    # 创建输出目录
    mkdir -p "$OUTPUT_PATH"

    # 下载 ZIP 文件
    TEMP_ZIP="/tmp/mlm-sync-$$.zip"
    echo -e "${GREEN}⬇️  Downloading...${NC}"
    if download_file "$URL" "$TEMP_ZIP"; then
        echo -e "${GREEN}✅ Download successful${NC}"
    else
        echo -e "${RED}❌ Download failed${NC}" >&2
        exit 3
    fi

    # 解压文件
    if [ "$DRY_RUN" = false ]; then
        echo -e "${GREEN}📦 Extracting...${NC}"
        if unzip -q -o "$TEMP_ZIP" -d "$OUTPUT_PATH"; then
            echo -e "${GREEN}✅ Extract successful${NC}"
        else
            echo -e "${RED}❌ Extract failed${NC}" >&2
            exit 4
        fi
    fi

    # 清理临时文件
    rm -f "$TEMP_ZIP"

    echo -e "${GREEN}✅ Sync completed successfully${NC}"
    echo "   Output: $OUTPUT_PATH"
}

# 运行主函数
main "$@"
```

---

## Android 脚本规范（Groovy/Gradle）

### 脚本文件名
- 主脚本：`mlm-sync.groovy`
- 可执行权限：`chmod +x mlm-sync.groovy`

### 命令行接口

**基本用法：**
```bash
./mlm-sync.groovy [options]
```

**命令行参数：**
```bash
-p, --project-id <id>         项目 ID
-k, --api-key <key>           API Key
-o, --output <path>           输出路径
-l, --languages <codes>       语言代码（逗号分隔）
-u, --api-url <url>           API 基础 URL
-t, --timeout <seconds>       请求超时时间
-r, --retries <number>        失败重试次数
-v, --verbose                 详细输出
-h, --help                    显示帮助
-c, --config <file>           指定配置文件
--init                        初始化配置文件
--dry-run                     预演模式，不实际下载
```

### Gradle 集成

**在 `app/build.gradle` 中添加任务：**

```groovy
task mlmSync(type: Exec) {
    description = 'Sync MultiLanguageManager translations'
    group = 'mlm'

    def config = new groovy.json.JsonSlurper().parse(file('mlm.config.json'))

    commandLine './mlm-sync.groovy',
            '-c', 'mlm.config.json',
            '-p', config.projectId,
            '-k', config.apiKey,
            '-o', config.outputPath
}

// 在 preBuild 任务之前执行
tasks.whenTaskAdded { task ->
    if (task.name == 'preBuild') {
        task.dependsOn mlmSync
    }
}
```

**运行任务：**
```bash
./gradlew mlmSync
```

### 错误处理

**异常定义：**
```groovy
enum ExitCode {
    SUCCESS(0),
    GENERIC_ERROR(1),
    CONFIG_NOT_FOUND(2),
    API_REQUEST_FAILED(3),
    DOWNLOAD_FAILED(4),
    EXTRACT_FAILED(5)

    private final int code

    ExitCode(int code) {
        this.code = code
    }

    int getCode() {
        return code
    }
}
```

---

## Web 脚本规范（Node.js）

### 脚本文件名
- 主脚本：`mlm-sync.js`
- 可执行权限：`chmod +x mlm-sync.js`

### 命令行接口

**基本用法：**
```bash
node mlm-sync.js [options]
# 或
./mlm-sync.js [options]
```

**命令行参数：**
```bash
-p, --project-id <id>         项目 ID
-k, --api-key <key>           API Key
-o, --output <path>           输出路径
-l, --languages <codes>       语言代码（逗号分隔）
-u, --api-url <url>           API 基础 URL
-t, --timeout <seconds>       请求超时时间
-r, --retries <number>        失败重试次数
-v, --verbose                 详细输出
-h, --help                    显示帮助
-c, --config <file>           指定配置文件
--init                        初始化配置文件
--dry-run                     预演模式，不实际下载
```

### npm scripts 集成

**在 `package.json` 中添加脚本：**

```json
{
  "name": "my-web-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "build": "webpack --mode production",
    "mlm-sync": "node mlm-sync.js -c mlm.config.json",
    "prebuild": "npm run mlm-sync",
    "mlm-init": "node mlm-sync.js --init"
  },
  "devDependencies": {
    "axios": "^1.6.0",
    "commander": "^11.0.0"
  }
}
```

**运行脚本：**
```bash
# 初始化配置
npm run mlm-init

# 同步文案
npm run mlm-sync

# 构建前自动同步
npm run build
```

### 错误处理

**错误码定义：**
```javascript
const ExitCode = {
    SUCCESS: 0,
    GENERIC_ERROR: 1,
    CONFIG_NOT_FOUND: 2,
    API_REQUEST_FAILED: 3,
    DOWNLOAD_FAILED: 4,
    EXTRACT_FAILED: 5
};
```

### 完整脚本示例

```javascript
#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');
const { program } = require('commander');

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

const log = {
    error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`ℹ️  ${msg}`)
};

// 退出码
const ExitCode = {
    SUCCESS: 0,
    GENERIC_ERROR: 1,
    CONFIG_NOT_FOUND: 2,
    API_REQUEST_FAILED: 3,
    DOWNLOAD_FAILED: 4,
    EXTRACT_FAILED: 5
};

// 默认配置
let config = {
    projectId: '',
    apiKey: '',
    platform: 'web',
    languages: ['CN', 'EN', 'DE'],
    outputPath: './src/i18n',
    apiUrl: 'https://api.multilanguage.internal/api/v1',
    timeout: 30,
    retries: 3,
    verbose: false
};

// 初始化配置文件
async function initConfig() {
    const configTemplate = JSON.stringify(config, null, 2);
    await fs.writeFile('mlm.config.json', configTemplate);
    log.success('Config file created: mlm.config.json');
    log.warning('Please edit mlm.config.json and fill in projectId and apiKey');
    process.exit(ExitCode.SUCCESS);
}

// 加载配置文件
async function loadConfig(configFile) {
    try {
        const configContent = await fs.readFile(configFile, 'utf8');
        config = JSON.parse(configContent);
    } catch (error) {
        log.error(`Config file not found: ${configFile}`);
        process.exit(ExitCode.CONFIG_NOT_FOUND);
    }
}

// 下载文件
async function downloadFile(url, outputPath) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
            'Authorization': `ApiKey ${config.apiKey}`
        },
        timeout: config.timeout * 1000
    });

    const writer = require('fs').createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// 解压文件
async function extractFile(zipPath, outputPath) {
    await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: outputPath }))
        .promise();
}

// 主函数
async function main() {
    program
        .option('-p, --project-id <id>', 'Project ID')
        .option('-k, --api-key <key>', 'API Key')
        .option('-o, --output <path>', 'Output path')
        .option('-l, --languages <codes>', 'Language codes (comma-separated)')
        .option('-u, --api-url <url>', 'API base URL')
        .option('-t, --timeout <seconds>', 'Request timeout')
        .option('-r, --retries <number>', 'Retries on failure')
        .option('-v, --verbose', 'Verbose output')
        .option('-c, --config <file>', 'Use config file')
        .option('--init', 'Initialize config file')
        .option('--dry-run', 'Dry run, don\'t actually download')
        .parse(process.argv);

    const options = program.opts();

    // 处理初始化
    if (options.init) {
        await initConfig();
    }

    // 加载配置文件
    if (options.config) {
        await loadConfig(options.config);
    }

    // 合并命令行参数
    config = {
        ...config,
        projectId: options.projectId || config.projectId,
        apiKey: options.apiKey || config.apiKey,
        outputPath: options.output || config.outputPath,
        languages: options.languages ? options.languages.split(',') : config.languages,
        apiUrl: options.apiUrl || config.apiUrl,
        timeout: parseInt(options.timeout) || config.timeout,
        retries: parseInt(options.retries) || config.retries,
        verbose: options.verbose || config.verbose
    };

    // 验证必填参数
    if (!config.projectId || !config.apiKey || !config.outputPath) {
        log.error('Missing required parameters');
        log.warning('Use --init to create a config file or provide -p, -k, -o options');
        process.exit(ExitCode.GENERIC_ERROR);
    }

    // 显示配置
    if (config.verbose) {
        log.success('Configuration:');
        console.log(`  Project ID: ${config.projectId}`);
        console.log(`  API URL: ${config.apiUrl}`);
        console.log(`  Output Path: ${config.outputPath}`);
        console.log(`  Languages: ${config.languages.join(', ')}`);
        console.log(`  Timeout: ${config.timeout}s`);
        console.log(`  Retries: ${config.retries}`);
        console.log(`  Dry Run: ${options.dryRun || false}`);
        console.log('');
    }

    // 构建下载 URL
    const languages = config.languages.join(',');
    const url = `${config.apiUrl}/projects/${config.projectId}/download?platform=web&languages=${languages}`;

    // 创建输出目录
    await fs.mkdir(config.outputPath, { recursive: true });

    try {
        // 下载 ZIP 文件
        const tempZip = `/tmp/mlm-sync-${Date.now()}.zip`;
        log.info('Downloading...');

        if (options.dryRun) {
            log.warning(`Dry run: would download ${url} to ${tempZip}`);
        } else {
            let retry = 0;
            while (retry < config.retries) {
                try {
                    await downloadFile(url, tempZip);
                    log.success('Download successful');
                    break;
                } catch (error) {
                    retry++;
                    if (retry < config.retries) {
                        log.warning(`Download failed, retrying (${retry}/${config.retries})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        throw error;
                    }
                }
            }

            // 解压文件
            log.info('Extracting...');
            await extractFile(tempZip, config.outputPath);
            log.success('Extract successful');

            // 清理临时文件
            await fs.unlink(tempZip);
        }

        log.success('Sync completed successfully');
        console.log(`   Output: ${config.outputPath}`);

        process.exit(ExitCode.SUCCESS);
    } catch (error) {
        log.error(`Sync failed: ${error.message}`);
        if (config.verbose) {
            console.error(error);
        }
        process.exit(ExitCode.API_REQUEST_FAILED);
    }
}

// 运行主函数
main();
```

---

## 日志规范

### 日志格式
```json
{
  "timestamp": "2026-02-27T10:00:00Z",
  "level": "info|warn|error",
  "message": "Sync started",
  "context": {
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "platform": "ios",
    "languages": ["CN", "EN", "DE"]
  }
}
```

### 日志级别
- `info`: 一般信息
- `warn`: 警告信息
- `error`: 错误信息

### 日志文件位置
- `.mlm/logs/mlm-sync.log`
- 日志文件轮转：每天一个文件，保留 7 天

---

## 测试规范

### 单元测试
- 为每个脚本编写单元测试
- 测试命令行参数解析
- 测试配置文件加载
- 测试错误处理

### 集成测试
- 测试 API 集成
- 测试文件下载和解压
- 测试重试逻辑

---

## 文档规范

### README 文件
每个脚本目录应包含 README.md 文件，说明：
- 脚本用途
- 安装步骤
- 使用方法
- 配置说明
- 常见问题

### 注释规范
- 脚本头部包含版本、作者、日期
- 关键函数添加注释
- 复杂逻辑添加解释

---

## 版本控制

### 版本号格式
主版本号.次版本号.修订号（如 1.0.0）
- 主版本：不兼容的 API 更改
- 次版本：向下兼容的功能新增
- 修订号：向下兼容的问题修正

### 版本更新
- 每次更新更新脚本头部的版本号
- 在 CHANGELOG.md 中记录变更

---

## 附录：常见问题

### Q: 如何调试脚本？
A: 使用 `-v` 或 `--verbose` 参数启用详细输出。

### Q: 如何跳过 SSL 证书验证？
A: 在配置文件中添加 `"rejectUnauthorized": false`（不推荐用于生产环境）。

### Q: 如何指定代理？
A: 设置环境变量 `HTTP_PROXY` 和 `HTTPS_PROXY`。

### Q: 脚本失败后如何恢复？
A: 脚本会保留上次下载的文件，可以检查 `.mlm/cache/` 目录。

---

## 附录：快速开始

### iOS 项目
```bash
# 1. 下载脚本
curl -O https://scripts.multilanguage.internal/mlm-sync.sh
chmod +x mlm-sync.sh

# 2. 初始化配置
./mlm-sync.sh --init

# 3. 编辑配置文件
# 编辑 mlm.config.json，填写 projectId 和 apiKey

# 4. 运行同步
./mlm-sync.sh

# 5. 集成到 Xcode
# 在 Xcode Build Phase 中添加脚本引用
```

### Android 项目
```bash
# 1. 下载脚本
curl -O https://scripts.multilanguage.internal/mlm-sync.groovy
chmod +x mlm-sync.groovy

# 2. 初始化配置
./mlm-sync.groovy --init

# 3. 编辑配置文件
# 编辑 mlm.config.json，填写 projectId 和 apiKey

# 4. 运行同步
./mlm-sync.groovy

# 5. 集成到 Gradle
# 在 app/build.gradle 中添加 mlmSync 任务
```

### Web 项目
```bash
# 1. 下载脚本
curl -O https://scripts.multilanguage.internal/mlm-sync.js
chmod +x mlm-sync.js

# 2. 安装依赖
npm install axios commander unzipper

# 3. 初始化配置
node mlm-sync.js --init

# 4. 编辑配置文件
# 编辑 mlm.config.json，填写 projectId 和 apiKey

# 5. 运行同步
node mlm-sync.js

# 6. 集成到 npm scripts
# 在 package.json 中添加 mlm-sync 脚本
```
