import {
  runMigrations,
  listAppliedMigrations,
  closeMigrations,
  sequelize,
} from './utils/migrationRunner.js';

const run = async () => {
  try {
    console.log('🔄 Running Sequelize migrations...');
    const results = await runMigrations();
    const applied = await listAppliedMigrations();
    console.log('✅ Migration completed successfully!');
    console.log('📋 Applied migrations:', applied.map((m) => m.name));
    if (results.length === 0) {
      console.log('ℹ️  No pending migrations.');
    }

    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const normalized = tables.map((table) => (typeof table === 'object' ? table.tableName : table));
    const usageTables = normalized.filter((table) => ['usage_logs', 'monthly_usage'].includes(table));
    console.log('📋 Usage tracking tables:', usageTables);

    const usersTable = await queryInterface.describeTable('users');
    if (usersTable.plan_type) {
      console.log('✅ plan_type column exists in users table');
    } else {
      console.log('⚠️  plan_type column not found in users table');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await closeMigrations();
  }
};

run();
