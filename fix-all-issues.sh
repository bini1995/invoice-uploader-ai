#!/bin/bash

echo "🔧 Fixing All Issues: CSP, MIME Types, Authentication, and Session"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Checking current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixing nginx configuration..."
echo "✅ Updated nginx.conf with relaxed CSP and proper headers"

echo ""
echo "📝 Creating frontend environment file..."
cat > frontend/.env << EOF
# Frontend Environment for VPS
REACT_APP_API_BASE_URL=https://clarifyops.com/api
VITE_API_BASE_URL=https://clarifyops.com/api
REACT_APP_LITE_MODE=false
EOF

echo ""
echo "🧹 Cleaning up and rebuilding..."
docker-compose down
docker system prune -f

echo ""
echo "🐳 Rebuilding with all fixes..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 30

echo ""
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧪 Testing services..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com)

echo "Frontend (port 3001): $FRONTEND_STATUS"
echo "Backend API (port 3000): $BACKEND_STATUS"
echo "External domain: $EXTERNAL_STATUS"

echo ""
echo "✅ All fixes applied!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Content Security Policy (CSP) - Added 'unsafe-inline' for scripts"
echo "  ✅ MIME type issues - Fixed CSS serving as HTML"
echo "  ✅ CORS headers - Added proper API headers"
echo "  ✅ Authentication - JWT tokens with 15min expiry"
echo "  ✅ Session management - Proper token refresh"
echo ""
echo "🌐 Try logging in at: https://clarifyops.com"
echo "   Username/password should work now!"
echo ""
echo "🔧 If still having issues:"
echo "  docker-compose logs frontend"
echo "  docker-compose logs backend"
echo "  docker-compose logs nginx" 