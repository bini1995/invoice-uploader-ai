#!/bin/bash

# Fix Backend Issues Script for VPS
# This script fixes the database schema issues and authentication problems

echo "🔧 Fixing Backend Issues on VPS..."

# Navigate to the project directory
cd /root/invoice-uploader-ai

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Fix the database schema issue in ocrAgent.js
echo "🔧 Fixing database query in ocrAgent.js..."
sed -i 's/SELECT d\.vendor, f\.suggested_category FROM category_feedback f JOIN documents d ON f\.document_id = d\.id WHERE f\.accepted = TRUE/SELECT f\.suggested_category FROM category_feedback f WHERE f\.accepted = TRUE/' backend/utils/ocrAgent.js

# Add comment to explain the fix
sed -i '/SELECT f\.suggested_category FROM category_feedback f WHERE f\.accepted = TRUE/a\    // Note: documents table does not have vendor column, so we skip vendor association for now' backend/utils/ocrAgent.js

# Create test user script
echo "👤 Creating test user script..."
cat > create-test-user.js << 'EOF'
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

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
    
    console.log('Test user created:', rows[0]);
    console.log('Login credentials:');
    console.log('Username:', username);
    console.log('Password:', password);
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    await pool.end();
  }
}

createTestUser();
EOF

# Restart the backend container
echo "🔄 Restarting backend container..."
docker-compose restart backend

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Create test user
echo "👤 Creating test user..."
docker-compose exec backend node create-test-user.js

# Test the API
echo "🧪 Testing API endpoints..."
echo "Testing health endpoint..."
curl -s http://localhost:3000/api/health

echo -e "\nTesting login endpoint..."
curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'

echo -e "\n✅ Backend fixes completed!"
echo "🔗 You can now test the 'Go to Dashboard' button on clarifyops.com"
echo "📧 Test login: test@example.com / password123"
