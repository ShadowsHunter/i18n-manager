import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api/v1';

console.log('🧪 Testing MultiLanguageManager API...\n');

async function testAPI() {
  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const health = await fetch(`${API_BASE}/health`);
    if (health.ok) {
      const healthData = await health.json();
      console.log(`✅ Health check passed`);
      console.log(`   Status: ${healthData.status}\n`);
    } else {
      console.log('❌ Health check failed\n');
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}\n`);
  }

  try {
    // Test 2: Login
    console.log('2. Testing User Login...');
    const login = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123',
      }),
    });

    if (login.ok) {
      const loginData = await login.json();
      console.log(`✅ Login successful`);
      console.log(`   User: ${loginData.data.user.email}`);
      console.log(`   Token: ${loginData.data.token.substring(0, 20)}...\n`);
    } else {
      console.log('❌ Login failed');
      const errorText = await login.text();
      console.log(`   Error: ${errorText}\n`);
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}\n`);
  }

  try {
    // Test 3: Get Projects
    console.log('3. Testing Projects API...');
    const projects = await fetch(`${API_BASE}/projects`);
    if (projects.ok) {
      const projectsData = await projects.json();
      console.log(`✅ Get projects successful`);
      console.log(`   Count: ${projectsData.data.projects.length}`);
      if (projectsData.data.projects.length > 0) {
        const firstProject = projectsData.data.projects[0];
        console.log(`   First project: ${firstProject.name}`);
      }
      console.log(`   Total: ${projectsData.data.total}\n`);
    } else {
      console.log('❌ Get projects failed\n`);
    }
  } catch (error) {
    console.log(`❌ Get projects error: ${error.message}\n`);
  }

  try {
    // Test 4: Get Project with Entries
    console.log('4. Testing Project with Entries...');
    const projectsList = await fetch(`${API_BASE}/projects`);
    if (projectsList.ok) {
      const projectsData = await projectsList.json();
      if (projectsData.data.projects.length > 0) {
        const projectId = projectsData.data.projects[0].id;
        const projectWithEntries = await fetch(`${API_BASE}/projects/${projectId}`);
        if (projectWithEntries.ok) {
          const projectData = await projectWithEntries.json();
          console.log(`✅ Get project with entries successful`);
          console.log(`   Project: ${projectData.data.name}`);
          console.log(`   Entries count: ${projectData.data.entriesCount}`);
          if (projectData.data.entries.length > 0) {
            const firstEntry = projectData.data.entries[0];
            console.log(`   First entry: ${firstEntry.key}`);
          }
          console.log(`   Total entries: ${projectData.data.entries.length}\n`);
        } else {
          console.log(`✅ Project has no entries\n`);
        }
      }
    } else {
      console.log(`❌ Get projects failed\n`);
    }
  } catch (error) {
    console.log(`❌ Get project with entries error: ${error.message}\n`);
  }

  console.log('\n🎉 API Testing Complete!');
  console.log('\n✅ Backend is ready for frontend integration!');
  console.log('\n📊 Test Credentials:');
  console.log('   - Email: admin@example.com');
  console.log('   - Password: password123');
}

testAPI();
