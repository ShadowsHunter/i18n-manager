/**
 * Supabase Connection Test
 * Run this script to diagnose Supabase connectivity issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('🔍 Testing Supabase Connection');
console.log('='.repeat(50));
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseServiceKey ? 'Present (hidden)' : 'Missing'}`);
console.log('');

async function testConnection() {
  try {
    console.log('1️⃣  Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase client created successfully\n');

    console.log('2️⃣  Testing connection...');
    const { data, error } = await supabase.from('projects').select('count').limit(1);

    if (error) {
      console.error('❌ Connection test failed:');
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);
      console.error(`   Details: ${error.hint || 'N/A'}`);
      process.exit(1);
    }

    console.log('✅ Connection successful!');
    console.log(`   Database is accessible`);
    console.log(`   Count query returned:`, data);

    console.log('\n3️⃣  Testing table access...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);

    if (projectsError) {
      console.error('⚠️  Table access issue:');
      console.error(`   Error: ${projectsError.message}`);
      console.error(`   This might be a permissions issue or table does not exist`);
      process.exit(1);
    }

    console.log('✅ Table access successful!');
    console.log(`   Found ${projects?.length || 0} projects`);
  } catch (error: any) {
    console.error('❌ Unexpected error:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    if (error.message.includes('fetch failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify SUPABASE_URL is correct');
      console.log('   3. Check if firewall/proxy is blocking the connection');
      console.log('   4. Try connecting to Supabase from a browser:');
      console.log(`      ${supabaseUrl}`);
    }
    process.exit(1);
  }
}

testConnection()
  .then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed! Supabase is working correctly.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
