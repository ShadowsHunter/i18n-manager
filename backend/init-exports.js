/**
 * Exports表初始化脚本
 * 创建exports表用于存储导出任务信息
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔧 Creating Exports table...\n');

// Create exports table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  platforms TEXT NOT NULL,
  languages TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  errorMessage TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  completedAt TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
`;

try {
  db.exec(createTableSQL);
  console.log('✅ Exports table created successfully\n');

  // Check if table exists
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='exports'")
    .get();
  if (tables) {
    console.log('📊 Exports table structure verified\n');

    // Get table info
    const columns = db.prepare('PRAGMA table_info(exports)').all();
    console.log('📋 Exports table columns:');
    columns.forEach((col) => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    console.log();
  }

  // Create index for better query performance
  const createIndexSQL = `
CREATE INDEX IF NOT EXISTS idx_exports_projectId ON exports(projectId);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_createdBy ON exports(createdBy);
  `;

  db.exec(createIndexSQL);
  console.log('✅ Indexes created successfully\n');

  // Test insert
  const testInsert = db.prepare(`
INSERT INTO exports (id, projectId, platforms, languages, url, status, errorMessage, createdBy, createdAt, completedAt)
VALUES ('test-export-001', 'test-project-001', '["iOS","Android"]', '["EN","DE"]', NULL, 'PENDING', NULL, 'test-user', datetime('now'), NULL)
  `);

  try {
    testInsert.run();
    console.log('✅ Test export inserted successfully\n');

    // Clean up test data
    const cleanUp = db.prepare("DELETE FROM exports WHERE id = 'test-export-001'");
    cleanUp.run();
    console.log('✅ Test data cleaned up\n');
  } catch (error) {
    console.log('ℹ️ Test data already exists or insert failed:', error.message);
  }

  console.log('🎉 Exports table initialization complete!\n');
} catch (error) {
  console.error('❌ Error creating Exports table:', error.message);
  process.exit(1);
} finally {
  db.close();
}
