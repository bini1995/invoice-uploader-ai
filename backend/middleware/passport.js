import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-insecure-key';
}

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: (_req, _rawToken, done) => done(null, getJwtSecret()),
  },
  (payload, done) => done(null, payload)
);

passport.use(jwtStrategy);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true,
    proxy: true,
    scope: ['profile', 'email']
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || profile.name?.givenName || 'User';
      const googleId = profile.id;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR google_id = $2',
        [email, googleId]
      );

      let user;
      if (existingUser.rows.length > 0) {
        user = existingUser.rows[0];
        if (!user.google_id) {
          await pool.query(
            'UPDATE users SET google_id = $1, name = COALESCE(name, $2) WHERE id = $3',
            [googleId, name, user.id]
          );
          user.google_id = googleId;
          user.name = user.name || name;
        }
      } else {
        const newTenantId = `tenant_${Date.now().toString(36)}`;
        const result = await pool.query(
          `INSERT INTO users (username, email, name, google_id, password_hash, role, tenant_id)
           VALUES ($1, $2, $3, $4, '', 'viewer', $5)
           RETURNING *`,
          [email, email, name, googleId, newTenantId]
        );
        user = result.rows[0];
        await pool.query(
          'INSERT INTO tenants (tenant_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newTenantId, name || email]
        );
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export function generateTokensForUser(user) {
  const tenantId = user.tenant_id || `tenant_${user.id}`;
  const token = jwt.sign({
    userId: user.id,
    role: user.role,
    username: user.email || user.username,
    name: user.name,
    tenantId
  }, getJwtSecret(), { expiresIn: '24h' });

  const refreshToken = jwt.sign({
    userId: user.id,
    tokenId: crypto.randomUUID()
  }, getJwtSecret(), { expiresIn: '7d' });

  return { token, refreshToken };
}

export default passport;
