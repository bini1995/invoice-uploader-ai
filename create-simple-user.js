const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function createSimpleUser() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', ['test@test.com', passwordHash, 'admin']);
    console.log('Test user created: test@test.com / password123');
  } catch (err) {
    console.error('Error creating user:', err);
  } finally {
    await pool.end();
  }
}

createSimpleUser();
