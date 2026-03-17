/**
 * API Keys表初始化脚本
 * 创建api_keys表用于存储API密钥信息
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔧 Creating API Keys table...\n');

// Create api_keys table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  keyHash TEXT NOT NULL,
  prefix TEXT NOT NULL,
  suffix TEXT NOT NULL,
  lastUsed TEXT,
  usageCount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  expiresAt TEXT,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  revokedAt TEXT
);
`;

try {
  db.exec(createTableSQL);
  console.log('✅ API Keys table created successfully\n');

  // Check if table exists
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='api_keys'")
    .get();
  if (tables) {
    console.log('📊 API Keys table structure verified\n');

    // Get table info
    const columns = db.prepare('PRAGMA table_info(api_keys)').all();
    console.log('📋 API Keys table columns:');
    columns.forEach((col) => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    console.log();
  }

  // Create index for better query performance
  const createIndexSQL = `
CREATE INDEX IF NOT EXISTS idx_api_keys_userId ON api_keys(createdBy);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
  `;

  db.exec(createIndexSQL);
  console.log('✅ Indexes created successfully\n');

  // Test insert
  const testInsert = db.prepare(`
INSERT INTO api_keys (id, name, keyHash, prefix, suffix, lastUsed, usageCount, status, expiresAt, createdBy, createdAt, revokedAt)
VALUES ('test-key-001', 'Test API Key', '$2a$10$test.hash.value.here', 'mlm_test_', 'abcd', NULL, 0, 'ACTIVE', NULL, 'test-user', datetime('now'), NULL)
  `);

  try {
    testInsert.run();
    console.log('✅ Test API key inserted successfully\n');

    // Clean up test data
    const cleanUp = db.prepare("DELETE FROM api_keys WHERE id = 'test-key-001'");
    cleanUp.run();
    console.log('✅ Test data cleaned up\n');
  } catch (error) {
    console.log('ℹ️ Test data already exists or insert failed:', error.message);
  }

  console.log('🎉 API Keys table initialization complete!\n');
} catch (error) {
  console.error('❌ Error creating API Keys table:', error.message);
  process.exit(1);
} finally {
  db.close();
}
