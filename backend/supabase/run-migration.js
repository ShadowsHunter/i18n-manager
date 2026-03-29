const { supabase, handleSupabaseError } = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

/**
 * Run a SQL migration file against Supabase
 */
async function runMigration() {
  const migrationPath = path.join(__dirname, '..', 'migrations', 'add_da_column.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicol and execute each statement
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    // Use the raw SQL query via Supabase's REST API
    const { error } = await supabase.rpc('exec_sql', { sql_string: statement });
    if (error) {
      console.log('Migration statement:', statement);
      console.error('Migration error:', error);
    }
  }
  console.log('Migration completed successfully');
}

// Run
runMigration()
  .then(() => {
    console.log('Done');
  })
  .catch((err) => {
    console.error('Migration failed:', err);
  });
