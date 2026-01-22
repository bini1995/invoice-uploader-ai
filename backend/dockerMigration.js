import {
  runMigrations,
  listAppliedMigrations,
  closeMigrations,
} from './utils/migrationRunner.js';

const run = async () => {
  try {
    console.log('🔄 Running Sequelize migrations (Docker)...');
    await runMigrations();
    const applied = await listAppliedMigrations();
    console.log('✅ Migration completed successfully!');
    console.log('📋 Applied migrations:', applied.map((m) => m.name));
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await closeMigrations();
  }
};

run();
