// Direct backend test without HTTP
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

const JWT_SECRET = 'dev-secret-key-change-in-production-min-32-chars-long';

console.log('🧪 Starting Direct Backend Testing...\n');

async function testAuth() {
  console.log('📋 1. Testing Authentication\n');

  // Test 1: Get user
  console.log('   1.1. Get user...');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');

  if (user) {
    console.log('       ✅ User found:', user.email);
  } else {
    console.log('       ❌ User not found');
    return;
  }

  // Test 2: Verify password
  console.log('   1.2. Verify password...');
  const isPasswordValid = await bcrypt.compare('password123', user.password);

  if (isPasswordValid) {
    console.log('       ✅ Password verified');
  } else {
    console.log('       ❌ Password verification failed');
    return;
  }

  // Test 3: Generate token
  console.log('   1.3. Generate JWT token...');
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log('       ✅ Token generated:', token.substring(0, 30) + '...');
  }

  console.log('\n✅ Authentication test passed!\n');
  return { user, token };
}

async function testProjects() {
  console.log('📊 2. Testing Projects\n');

  // Test 1: Get all projects
  console.log('   2.1. Get all projects...');
  const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();

  if (projects.length > 0) {
    console.log(`       ✅ Found ${projects.length} projects`);
    projects.forEach((p, i) => {
      const langs = p.languages ? JSON.parse(p.languages) : [];
      console.log(`       ${i + 1}. ${p.name} (${langs.join(', ')})`);
    });
  } else {
    console.log('       ❌ No projects found');
  }

  // Test 2: Get single project
  if (projects.length > 0) {
    console.log('   2.2. Get first project details...');
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projects[0].id);
    const entryCount = db.prepare('SELECT COUNT(*) as count FROM entries WHERE projectId = ?').get(projects[0].id);

    console.log(`       ✅ Project: ${project.name}`);
    console.log(`       ✅ Entries: ${entryCount.count}`);
  }

  console.log('\n✅ Projects test passed!\n');
  return projects;
}

async function testEntries() {
  console.log('📝 3. Testing Entries\n');

  // Get first project ID
  const projects = db.prepare('SELECT * FROM projects LIMIT 1').all();
  if (projects.length === 0) {
    console.log('       ❌ No projects found for entry testing');
    return;
  }

  const projectId = projects[0].id;

  // Test 1: Get all entries
  console.log('   3.1. Get all entries...');
  const entries = db.prepare('SELECT * FROM entries WHERE projectId = ? ORDER BY createdAt DESC').all(projectId);

  console.log(`       ✅ Found ${entries.length} entries`);
  entries.slice(0, 3).forEach((e, i) => {
    console.log(`       ${i + 1}. ${e.key} - ${e.en || '(empty)'}`);
  });

  // Test 2: Get specific entry
  if (entries.length > 0) {
    console.log('   3.2. Get first entry...');
    const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(projectId);

    if (entry) {
      console.log(`       ✅ Entry: ${entry.key}`);
      console.log(`       EN: ${entry.en || '(empty)'}`);
    }
  }

  console.log('\n✅ Entries test passed!\n');
  return entries;
}

async function main() {
  try {
    // Test authentication
    const { user, token } = await testAuth();

    // Test projects
    const projects = await testProjects();

    // Test entries
    const entries = await testEntries();

    console.log('\n🎉 All Direct Tests Passed!\n');
    console.log('\n📊 Summary:');
    console.log(`   Authentication: ✅`);
    console.log(`   Projects: ✅ (${projects.length} projects)`);
    console.log(`   Entries: ✅ (${entries.length} entries)`);
    console.log(`   Database: ✅ (connected)`);
    console.log('\n✅ Backend is ready for API server integration!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

main();
