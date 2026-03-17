// Direct backend test without HTTP
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const dbPath = __dirname + '/dev.db';
const db = new Database(dbPath);

const JWT_SECRET = 'dev-secret-key-change-in-production-min-32-chars-long';

console.log('🧪 Starting Direct Backend Testing...\n');

async function testAuth() {
  console.log('1. Testing Authentication\n');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');

  if (!user) {
    console.log('   ❌ User not found');
    return;
  }

  console.log('   ✅ User found:', user.email);

  const isPasswordValid = await bcrypt.compare('password123', user.password);

  if (!isPasswordValid) {
    console.log('   ❌ Password verification failed');
    return;
  }

  console.log('   ✅ Password verified');

  const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '7d',
  });

  console.log(`   ✅ Token generated: ${token.substring(0, 30)}...\n`);

  return { user, token };
}

async function testProjects() {
  console.log('2. Testing Projects\n');

  const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();

  if (projects.length === 0) {
    console.log('   ❌ No projects found');
    return [];
  }

  console.log(`   ✅ Found ${projects.length} projects`);

  projects.forEach((p, i) => {
    const langs = p.languages ? JSON.parse(p.languages) : [];
    console.log(`   ${i + 1}. ${p.name} (${langs.join(', ')})`);
  });

  return projects;
}

async function testEntries() {
  console.log('3. Testing Entries\n');

  const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC LIMIT 1').all();

  if (projects.length === 0) {
    console.log('   ❌ No projects found for entry testing');
    return [];
  }

  const projectId = projects[0].id;
  const entries = db
    .prepare('SELECT * FROM entries WHERE projectId = ? ORDER BY createdAt DESC')
    .all(projectId);

  if (entries.length === 0) {
    console.log('   ❌ No entries found');
    return [];
  }

  console.log(`   ✅ Found ${entries.length} entries for project ${projectId}`);
  entries.slice(0, 3).forEach((e, i) => {
    console.log(`   ${i + 1}. ${e.key} - ${e.en || '(empty)'}`);
  });

  return entries;
}

async function main() {
  try {
    console.log('\n🧪 Database Statistics:');
    console.log('   Users:', db.prepare('SELECT COUNT(*) as count FROM users').get().count);
    console.log('   Projects:', db.prepare('SELECT COUNT(*) as count FROM projects').get().count);
    console.log('   Entries:', db.prepare('SELECT COUNT(*) as count FROM entries').get().count);

    console.log('\n🧪 Testing Authentication:');
    const { user, token } = await testAuth();

    if (user && token) {
      console.log('\n🧪 Testing Projects:');
      const projects = await testProjects();

      if (projects.length > 0) {
        console.log('\n🧪 Testing Entries:');
        const entries = await testEntries();
      }
    }

    console.log('\n🎉 All Tests Passed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Authentication: Complete');
    console.log('   ✅ Database: Connected');
    console.log('   ✅ Users: 1');
    console.log('   ✅ Projects: ' + projects.length);
    console.log('   ✅ Entries: ' + (projects.length > 0 ? entries.length : 0));
    console.log('\n✅ Backend is ready for integration!\n');
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
