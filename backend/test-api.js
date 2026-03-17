import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api/v1';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testAPI() {
  console.log(`${colors.cyan}🧪 Testing MultiLanguageManager API${colors.reset}\n`);

  // Test 1: Health Check
  try {
    console.log(`${colors.blue}1. Testing Health Endpoint...${colors.reset}`);
    const health = await fetch(`${API_BASE}/health`);
    if (health.ok) {
      const healthData = await health.json();
      console.log(`${colors.green}✅ Health check passed${colors.reset}`);
      console.log(`   Status: ${healthData.status}\n`);
    } else {
      console.log(`${colors.red}❌ Health check failed${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Health check error:${colors.reset} ${error}\n`);
  }

  // Test 2: Register User
  try {
    console.log(`${colors.blue}2. Testing User Registration...${colors.reset}`);
    const register = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpass123',
        name: 'Test User',
      }),
    });
    if (register.ok) {
      const registerData = await register.json();
      console.log(`${colors.green}✅ Registration successful${colors.reset}`);
      console.log(`   User ID: ${registerData.data.user.id}`);
      console.log(`   Email: ${registerData.data.user.email}\n`);
    } else {
      console.log(`${colors.red}❌ Registration failed${colors.reset}`);
      const errorData = await register.json();
      console.log(`   Error: ${errorData.error.message}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Registration error:${colors.reset} ${error}\n`);
  }

  // Test 3: Login
  try {
    console.log(`${colors.blue}3. Testing User Login...${colors.reset}`);
    const login = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpass123',
      }),
    });
    if (login.ok) {
      const loginData = await login.json();
      console.log(`${colors.green}✅ Login successful${colors.reset}`);
      console.log(`   Token: ${loginData.data.token.substring(0, 20)}...\n`);
    } else {
      console.log(`${colors.red}❌ Login failed${colors.reset}`);
      const errorData = await login.json();
      console.log(`   Error: ${errorData.error.message}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Login error:${colors.reset} ${error}\n`);
  }

  // Test 4: Get Projects
  try {
    console.log(`${colors.blue}4. Testing Projects API...${colors.reset}`);
    const projects = await fetch(`${API_BASE}/projects`);
    if (projects.ok) {
      const projectsData = await projects.json();
      console.log(`${colors.green}✅ Get projects successful${colors.reset}`);
      console.log(`   Count: ${projectsData.data.projects.length}`);
      if (projectsData.data.projects.length > 0) {
        console.log(`   First project: ${projectsData.data.projects[0].name}`);
      }
      console.log(`   Total: ${projectsData.data.total}\n`);
    } else {
      console.log(`${colors.red}❌ Get projects failed${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Get projects error:${colors.reset} ${error}\n`);
  }

  // Test 5: Create Project
  try {
    console.log(`${colors.blue}5. Testing Create Project...${colors.reset}`);
    const createProject = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Test project for API testing',
        languages: ['EN', 'DE', 'FR'],
      }),
    });
    if (createProject.ok) {
      const projectData = await createProject.json();
      console.log(`${colors.green}✅ Create project successful${colors.reset}`);
      console.log(`   Project ID: ${projectData.data.id}`);
      console.log(`   Name: ${projectData.data.name}\n`);
    } else {
      console.log(`${colors.red}❌ Create project failed${colors.reset}`);
      const errorData = await createProject.json();
      console.log(`   Error: ${errorData.error.message}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Create project error:${colors.reset} ${error}\n`);
  }

  // Test 6: Get Entries
  try {
    console.log(`${colors.blue}6. Testing Entries API...${colors.reset}`);
    const entries = await fetch(`${API_BASE}/projects/test-project-id/entries`);
    if (entries.ok) {
      const entriesData = await entries.json();
      console.log(`${colors.green}✅ Get entries successful${colors.reset}`);
      console.log(`   Count: ${entriesData.data.entries.length}\n`);
    } else {
      console.log(
        `${colors.yellow}⚠️  Get entries expected to fail (project doesn't exist)${colors.reset}\n`
      );
    }
  } catch (error) {
    console.log(`${colors.red}❌ Get entries error:${colors.reset} ${error}\n`);
  }

  console.log(`${colors.cyan}🎉 API Testing Complete!${colors.reset}`);
  console.log(
    `${colors.yellow}💡 Note: Some tests may use mock data as database integration is in progress${colors.reset}`
  );
}

testAPI().catch((error) => {
  console.error(`${colors.red}Fatal error in API testing:${colors.reset}`, error);
  process.exit(1);
});
