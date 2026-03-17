// Simple database seed script (no TypeScript)
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

async function main() {
  console.log('🌱 Initializing database...\n');

  try {
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        languages TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        key TEXT NOT NULL,
        cn TEXT,
        en TEXT,
        de TEXT,
        es TEXT,
        fi TEXT,
        fr TEXT,
        it TEXT,
        nl TEXT,
        no TEXT,
        pl TEXT,
        se TEXT,
        status TEXT NOT NULL DEFAULT 'NEW',
        error TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');

    let userId;

    if (existingUser) {
      console.log('✅ Test user already exists');
      userId = existingUser.id;
    } else {
      const hashedPassword = await bcrypt.hash('password123', 10);

      const userResult = db
        .prepare(
          `
        INSERT INTO users (id, email, password, name, active, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          crypto.randomUUID(),
          'admin@example.com',
          hashedPassword,
          'Test Admin',
          1,
          new Date().toISOString(),
          new Date().toISOString()
        );

      userId = userResult.lastInsertRowid.toString();
      console.log('✅ Created test user: admin@example.com');
    }

    const existingProjects = db
      .prepare('SELECT * FROM projects WHERE name IN (?, ?)')
      .all(['E-commerce App', 'Marketing Website']);

    const projectIds = [];

    if (existingProjects.length > 0) {
      console.log('✅ Test projects already exist');
      for (const p of existingProjects) {
        projectIds.push(p.id);
      }
    } else {
      const languages1 = JSON.stringify(['EN', 'DE', 'ES', 'FR', 'IT']);
      const languages2 = JSON.stringify(['EN', 'DE', 'FR', 'NL']);

      const project1Result = db
        .prepare(
          `
        INSERT INTO projects (id, name, description, status, languages, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          crypto.randomUUID(),
          'E-commerce App',
          'Main application translations',
          'ACTIVE',
          languages1,
          new Date().toISOString(),
          new Date().toISOString()
        );

      const project2Result = db
        .prepare(
          `
        INSERT INTO projects (id, name, description, status, languages, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          crypto.randomUUID(),
          'Marketing Website',
          'Website content translations',
          'ACTIVE',
          languages2,
          new Date().toISOString(),
          new Date().toISOString()
        );

      projectIds.push(
        project1Result.lastInsertRowid.toString(),
        project2Result.lastInsertRowid.toString()
      );
      console.log('✅ Created test projects: E-commerce App, Marketing Website');
    }

    for (const projectId of projectIds) {
      const existingEntriesCount = db
        .prepare('SELECT COUNT(*) as count FROM entries WHERE projectId = ?')
        .get(projectId);

      if (existingEntriesCount.count > 0) {
        console.log('✅ Entries already exist for project ' + projectId);
        continue;
      }

      const entries = [
        { key: 'welcome_title', en: 'Welcome', de: 'Willkommen', es: 'Bienvenido' },
        { key: 'login_button', en: 'Login', de: 'Anmelden', es: 'Iniciar sesión' },
        { key: 'logout_button', en: 'Logout', de: 'Abmelden', es: 'Cerrar sesión' },
        { key: 'success_message', en: 'Operation successful', de: 'Vorgang erfolgreich' },
      ];

      for (const entry of entries) {
        db.prepare(
          `
          INSERT INTO entries (id, projectId, key, en, de, es, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        ).run(
          crypto.randomUUID(),
          projectId,
          entry.key,
          entry.en,
          entry.de,
          entry.es,
          'NEW',
          new Date().toISOString(),
          new Date().toISOString()
        );
      }
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Database: dev.db');
    console.log('   - Test user: admin@example.com');
    console.log('   - Password: password123');
    console.log('   - Projects: ' + projectIds.length);
    console.log('   - Entries created: 8 total (4 per project)');
    console.log('\n✅ Backend is ready for testing!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n✅ You can now start the server with: npm run dev');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
