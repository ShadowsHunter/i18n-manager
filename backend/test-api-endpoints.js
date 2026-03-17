#!/usr/bin/env node

/**
 * API端点测试脚本
 * 测试后端API的所有主要功能
 */

const API_BASE = 'http://localhost:3001/api/v1';

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testAPI() {
  console.log(`\n${colors.cyan}🧪 开始测试 MultiLanguageManager API 端点${colors.reset}\n`);

  let token = null;
  let projectId = null;

  try {
    // 1. 测试健康检查
    console.log(`${colors.blue}1. 测试健康检查 endpoint${colors.reset}`);
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response:`, JSON.stringify(healthData, null, 2));
    if (healthResponse.ok) {
      console.log(`   ${colors.green}✅ 健康检查通过${colors.reset}\n`);
    } else {
      console.log(`   ${colors.red}❌ 健康检查失败${colors.reset}\n`);
      return;
    }

    // 2. 测试用户登录
    console.log(`${colors.blue}2. 测试用户认证登录${colors.reset}`);
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, JSON.stringify(loginData, null, 2));

    if (loginResponse.ok && loginData.data && loginData.data.token) {
      token = loginData.data.token;
      console.log(`   ${colors.green}✅ 登录成功，获得Token${colors.reset}\n`);
    } else {
      console.log(`   ${colors.red}❌ 登录失败${colors.reset}\n`);
      return;
    }

    // 3. 测试获取项目列表
    console.log(`${colors.blue}3. 测试获取项目列表${colors.reset}`);
    const projectsResponse = await fetch(`${API_BASE}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const projectsData = await projectsResponse.json();
    console.log(`   Status: ${projectsResponse.status}`);
    console.log(`   Response:`, JSON.stringify(projectsData, null, 2));

    if (projectsResponse.ok && projectsData.data && projectsData.data.projects) {
      const projects = projectsData.data.projects;
      console.log(
        `   ${colors.green}✅ 获取项目列表成功，共 ${projects.length} 个项目${colors.reset}\n`
      );
      if (projects.length > 0) {
        projectId = projects[0].id;
        console.log(`   使用第一个项目ID: ${projectId}\n`);
      }
    } else {
      console.log(`   ${colors.red}❌ 获取项目列表失败${colors.reset}\n`);
    }

    // 4. 测试获取条目列表
    if (projectId) {
      console.log(`${colors.blue}4. 测试获取条目列表${colors.reset}`);
      const entriesResponse = await fetch(`${API_BASE}/projects/${projectId}/entries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const entriesData = await entriesResponse.json();
      console.log(`   Status: ${entriesResponse.status}`);
      console.log(`   Response:`, JSON.stringify(entriesData, null, 2));

      if (entriesResponse.ok && entriesData.data) {
        console.log(`   ${colors.green}✅ 获取条目列表成功${colors.reset}\n`);
      } else {
        console.log(`   ${colors.red}❌ 获取条目列表失败${colors.reset}\n`);
      }
    }

    // 5. 测试获取API密钥列表
    console.log(`${colors.blue}5. 测试获取API密钥列表${colors.reset}`);
    const apiKeysResponse = await fetch(`${API_BASE}/api-keys`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const apiKeysData = await apiKeysResponse.json();
    console.log(`   Status: ${apiKeysResponse.status}`);
    console.log(`   Response:`, JSON.stringify(apiKeysData, null, 2));

    if (apiKeysResponse.ok && apiKeysData.data) {
      console.log(`   ${colors.green}✅ 获取API密钥列表成功${colors.reset}\n`);
    } else {
      console.log(`   ${colors.red}❌ 获取API密钥列表失败${colors.reset}\n`);
    }

    console.log(`${colors.green}🎉 所有API端点测试完成！${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ 测试过程中发生错误:${colors.reset}`, error.message);
    console.log(
      `\n${colors.yellow}提示: 请确保后端服务器正在运行 (http://localhost:3001)${colors.reset}\n`
    );
    console.log(`可以使用以下命令启动服务器:`);
    console.log(`  cd backend && npm run dev`);
    console.log(`或者:`);
    console.log(`  cd backend && node test-server.js\n`);
  }
}

// 运行测试
testAPI();
