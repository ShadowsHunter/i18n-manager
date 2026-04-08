#!/usr/bin/env node

/**
 * 远程触发导出 JSON 格式多语言文件并解压到项目根目录下的 languages 文件夹
 *
 * 用法:
 *   node scripts/export-languages.js --project <项目名> [--api <API地址>] [--email <邮箱>] [--password <密码>]
 *
 * 示例:
 *   node scripts/export-languages.js --project Kress
 *   node scripts/export-languages.js --project Kress --api http://localhost:3001/api/v1
 *   node scripts/export-languages.js --project Kress --email admin@example.com --password admin123
 *
 * 环境变量 (可选):
 *   MLM_API_BASE  - API 地址 (默认 http://localhost:3001/api/v1)
 *   MLM_EMAIL      - 登录邮箱 (默认 admin@example.com)
 *   MLM_PASSWORD   - 登录密码 (默认 admin123)
 */

const fs = require('fs');
const path = require('path');

// --- 解析命令行参数 ---
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) opts.project = args[++i];
    if (args[i] === '--api' && args[i + 1]) opts.api = args[++i];
    if (args[i] === '--email' && args[i + 1]) opts.email = args[++i];
    if (args[i] === '--password' && args[i + 1]) opts.password = args[++i];
    if (args[i] === '--output' && args[i + 1]) opts.output = args[++i];
  }

  return {
    project: opts.project,
    api: opts.api || process.env.MLM_API_BASE || 'http://localhost:3001/api/v1',
    email: opts.email || process.env.MLM_EMAIL || 'admin@example.com',
    password: opts.password || process.env.MLM_PASSWORD || 'admin123',
    output: opts.output || path.resolve(process.cwd(), 'languages'),
  };
}

// --- API 请求封装 ---
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message || data?.message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

// --- 主流程 ---
async function main() {
  const { project: projectName, api, email, password, output } = parseArgs();

  if (!projectName) {
    console.error('错误: 请指定项目名称');
    console.error('用法: node scripts/export-languages.js --project <项目名>');
    console.error('');
    console.error('可用项目:');
    try {
      // 不需要 token 也能 list projects
      const projectsRes = await request(`${api}/projects`);
      const projects = projectsRes.data?.projects || projectsRes.data || [];
      for (const p of projects) {
        console.error(`  - ${p.name} (${p.languages?.join(', ') || '无语言'})`);
      }
    } catch {
      console.error('  (无法获取项目列表，请确认后端已启动)');
    }
    process.exit(1);
  }

  console.log(`\n=== 多语言导出工具 ===\n`);
  console.log(`项目: ${projectName}`);
  console.log(`API:  ${api}`);
  console.log(`输出: ${output}\n`);

  // Step 1: 登录
  console.log('[1/4] 登录...');
  const loginRes = await request(`${api}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const token = loginRes.data?.token;
  if (!token) {
    throw new Error('登录失败: 未获取到 token');
  }
  console.log(`  登录成功: ${loginRes.data?.user?.email || email}`);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Step 2: 查找项目
  console.log('[2/4] 查找项目...');
  const projectsRes = await request(`${api}/projects`, { headers: authHeaders });
  const projects = projectsRes.data?.projects || projectsRes.data || [];
  const targetProject = projects.find(
    (p) => p.name.toLowerCase() === projectName.toLowerCase()
  );

  if (!targetProject) {
    console.error(`\n错误: 未找到项目 "${projectName}"`);
    console.error('可用项目:');
    for (const p of projects) {
      console.error(`  - ${p.name}`);
    }
    process.exit(1);
  }

  const projectId = targetProject.id;
  const languages = targetProject.languages || [];
  console.log(`  找到项目: ${targetProject.name} (ID: ${projectId})`);
  console.log(`  支持语言: ${languages.join(', ')}`);

  // Step 3: 创建导出任务
  console.log('[3/4] 创建导出任务...');
  const exportRes = await request(`${api}/exports/${projectId}/export`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      platforms: ['JSON'],
      languages,
    }),
  });

  if (!exportRes.data) {
    throw new Error('创建导出任务失败');
  }
  console.log(`  导出任务已创建 (ID: ${exportRes.data.id})`);

  // Step 4: 获取所有条目并生成 JSON 文件
  console.log('[4/4] 获取翻译条目...');
  const entriesRes = await request(`${api}/projects/${projectId}/entries/all`, {
    headers: authHeaders,
  });

  const entries = entriesRes.data?.entries || [];
  console.log(`  获取到 ${entries.length} 条翻译`);

  if (entries.length === 0) {
    console.warn('\n警告: 项目没有任何翻译条目，跳过文件生成');
    return;
  }

  // 创建输出目录
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // 为每种语言生成 JSON 文件
  const languageCodeMap = {
    CN: 'zh-CN',
    EN: 'en',
    DE: 'de',
    ES: 'es',
    FI: 'fi',
    FR: 'fr',
    IT: 'it',
    NL: 'nl',
    NO: 'no',
    PL: 'pl',
    SE: 'sv-SE',
    DA: 'da',
  };

  const generatedFiles = [];

  for (const lang of languages) {
    const langEntries = {};

    for (const entry of entries) {
      const value = entry[lang.toLowerCase()];
      if (value !== null && value !== undefined && value !== '') {
        langEntries[entry.key] = value;
      }
    }

    if (Object.keys(langEntries).length === 0) {
      console.log(`  跳过 ${lang}: 无翻译内容`);
      continue;
    }

    // 使用语言代码映射作为文件名
    const localeCode = languageCodeMap[lang] || lang.toLowerCase();
    const fileName = `${localeCode}.json`;
    const filePath = path.join(output, fileName);

    fs.writeFileSync(filePath, JSON.stringify(langEntries, null, 2), 'utf-8');
    generatedFiles.push({ lang, localeCode, count: Object.keys(langEntries).length, file: fileName });
  }

  // 生成汇总信息
  console.log('\n=== 导出完成 ===\n');
  console.log(`输出目录: ${output}`);
  console.log(`生成文件:`);

  let totalKeys = 0;
  for (const f of generatedFiles) {
    console.log(`  ${f.file.padEnd(15)} ${String(f.count).padStart(4)} 条 (${f.lang})`);
    totalKeys += f.count;
  }

  console.log(`\n总计: ${generatedFiles.length} 个语言文件, ${totalKeys} 条翻译`);
}

main().catch((err) => {
  console.error(`\n错误: ${err.message}`);
  process.exit(1);
});
