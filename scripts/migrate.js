const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      return;
    }
    
    console.log('Migration completed successfully!');
    
    // Run seed data
    console.log('Running seed data...');
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    const { data: seedData, error: seedError } = await supabase.rpc('exec_sql', { sql: seedSQL });
    
    if (seedError) {
      console.error('Seed error:', seedError);
      return;
    }
    
    console.log('Seed data completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();
