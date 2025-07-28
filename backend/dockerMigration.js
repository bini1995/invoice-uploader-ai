const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runDockerMigration() {
  try {
    console.log('🔄 Running usage tracking migration via Docker...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'create_usage_tracking_tables.sql');
    
    // Copy the migration file to the Docker container and execute it
    const command = `docker exec -i web-db-1 psql -U postgres -d invoices_db < ${migrationPath}`;
    
    console.log('Executing command:', command);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Migration failed:', error.message);
        return;
      }
      if (stderr) {
        console.log('⚠️  Warnings:', stderr);
      }
      if (stdout) {
        console.log('📋 Output:', stdout);
      }
      console.log('✅ Migration completed successfully!');
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runDockerMigration(); 