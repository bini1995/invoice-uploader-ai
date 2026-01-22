import { Sequelize } from 'sequelize';
import 'dotenv/config';
import logger from '../utils/logger.js';

const buildSequelizeConfig = () => {
  const host = process.env.DB_HOST || 'db';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'TATA1tata1';
  const database = process.env.DB_NAME || 'invoices_db';

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      const badHosts = ['localhost', '127.0.0.1', '::1'];
      const needsOverride = badHosts.includes(url.hostname) || url.port === '5433';
      if (needsOverride) {
        url.hostname = host;
        url.port = String(port);
      }
      url.searchParams.set('sslmode', 'disable');
      return { url: url.toString() };
    } catch (err) {
      return { url: process.env.DATABASE_URL };
    }
  }

  logger.info('DATABASE_URL not set for Sequelize, using DB_* env vars');
  return {
    database,
    user,
    password,
    host,
    port,
  };
};

const config = buildSequelizeConfig();

const sequelize = config.url
  ? new Sequelize(config.url, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize(config.database, config.user, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: false,
    });

export default sequelize;
