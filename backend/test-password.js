const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

// Generate hash for password
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Generated hash:', hash);

// Update user password
const updateStmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
const result = updateStmt.run(hash, 'admin@example.com');
console.log('Update result:', result);

// Verify the user
const user = db
  .prepare('SELECT id, email, password FROM users WHERE email = ?')
  .get('admin@example.com');
console.log('User record:', user);

// Verify password works
const isValid = bcrypt.compareSync('admin123', user.password);
console.log('Password verification:', isValid);

db.close();
