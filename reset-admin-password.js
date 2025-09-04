const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function resetAdminPassword() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [passwordHash, 'admin']);
    console.log('Admin password reset to: admin123');
  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
