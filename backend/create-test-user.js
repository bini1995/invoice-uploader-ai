
import bcrypt from 'bcrypt';
import pool from './config/db.js';
async function createTestUser() {
  try {
    const username = 'test@example.com';
    const password = 'password123';
    const role = 'admin';
    
    // Check if user already exists
    const { rows: existing } = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (existing.length > 0) {
      console.log('User already exists');
      return;
    }
    
    // Create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, passwordHash, role]
    );
    
    console.log('Test user created:', rows[0].id, rows[0].username, rows[0].role);
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    await pool.end();
  }
}

createTestUser();
