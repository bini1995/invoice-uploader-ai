import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import crypto from 'crypto';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

const PgSession = connectPgSimple(session);

const ensureSessionSecret = () => {
  const existing = process.env.SESSION_SECRET;
  if (existing && existing.length >= 32) {
    return existing;
  }
  if (process.env.NODE_ENV === 'production') {
    logger.error('SESSION_SECRET is missing or too short. Must be at least 32 characters.');
    process.exit(1);
  }
  const generated = crypto.randomBytes(32).toString('hex');
  logger.warn('SESSION_SECRET is missing or too short. Generated a development secret.');
  process.env.SESSION_SECRET = generated;
  return generated;
};

const createSessionMiddleware = ({ store } = {}) => {
  const sessionStore =
    store ||
    new PgSession({
      pool,
      tableName: process.env.SESSION_TABLE_NAME || 'user_sessions',
      createTableIfMissing: true
    });

  return session({
    name: process.env.SESSION_COOKIE_NAME || 'invoice.sid',
    secret: ensureSessionSecret(),
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  });
};

export default createSessionMiddleware;
