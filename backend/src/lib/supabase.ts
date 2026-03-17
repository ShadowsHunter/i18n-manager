/**
 * Supabase Client Initialization
 * Singleton instance for server-side Supabase operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables (from .env or .env.local)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not found in environment variables');
  console.warn('   Please create a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.warn('   See .env.supabase.example for reference');
}

console.log('✅ Supabase client initialized');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Timeout: ${process.env.SUPABASE_TIMEOUT || '30000'}ms`);
console.log(`   Max Retries: ${process.env.SUPABASE_MAX_RETRIES || '3'}`);

// Custom fetch with timeout and retry logic
const customFetch = async (url: any, options?: RequestInit): Promise<Response> => {
  const timeout = parseInt(process.env.SUPABASE_TIMEOUT || '30000', 10); // Default 30s
  const maxRetries = parseInt(process.env.SUPABASE_MAX_RETRIES || '3', 10); // Default 3 retries

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`⏱️  Supabase request timeout (attempt ${attempt + 1}/${maxRetries + 1})`);
      } else if (error.name === 'TypeError' && error.message === 'fetch failed') {
        console.error(`🌐  Supabase connection failed (attempt ${attempt + 1}/${maxRetries + 1})`);
      } else {
        console.error(
          `❌  Supabase request error (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error.message
        );
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳  Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Final attempt failed, throw error
        throw error;
      }
    }
  }

  throw new Error('Supabase request failed after all retries');
};

// Create Supabase client with service role key for server-side operations
// This gives full access to all tables
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false, // Disable auto-refresh for server-side
    persistSession: false, // Don't persist session on server
  },
  db: {
    schema: 'public',
  },
  global: {
    fetch: customFetch,
  },
});

/**
 * Execute a database query with error handling
 */
export async function executeQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    const result = await queryFn(supabase);
    return result;
  } catch (error) {
    console.error(`❌ ${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
}

/**
 * Handle Supabase errors and convert to application errors
 */
export function handleSupabaseError(error: any): never {
  console.error('Supabase Error:', error);

  if (error.code) {
    // PostgreSQL error codes
    switch (error.code) {
      case '23505': // unique_violation
        throw new Error('Duplicate entry: This record already exists');
      case '23503': // foreign_key_violation
        throw new Error('Reference error: Related record not found');
      case '23502': // not_null_violation
        throw new Error('Validation error: Required field is missing');
      case 'PGRST116': // PostgREST error
        throw new Error('Not found: The requested record does not exist');
      default:
        throw new Error(`Database error (${error.code}): ${error.message}`);
    }
  }

  throw new Error(`Unexpected error: ${error.message || 'Unknown error'}`);
}
