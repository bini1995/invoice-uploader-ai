import path from 'path';
import { fileURLToPath } from 'url';
import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from '../config/sequelize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsPath = path.join(__dirname, '..', 'migrations');

const umzug = new Umzug({
  migrations: {
    glob: ['*.js', { cwd: migrationsPath }],
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const listAppliedMigrations = () => umzug.executed();

const runMigrations = async () => {
  const results = await umzug.up();
  return results;
};

const closeMigrations = async () => {
  await sequelize.close();
};

export {
  runMigrations,
  listAppliedMigrations,
  closeMigrations,
  sequelize,
};
