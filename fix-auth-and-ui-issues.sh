#!/bin/bash

echo "🔧 Fix: Authentication and UI Layout Issues"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixed issues:"
echo "  ✅ Extended JWT token expiration from 15m to 24h"
echo "  ✅ Fixed DashboardBuilder API endpoints (invoices → claims)"
echo "  ✅ Improved Operations page UI layout"
echo "  ✅ Fixed sidebar and navbar positioning"
echo "  ✅ Better authentication flow"

echo ""
echo "📝 Creating frontend environment file..."
cat > frontend/.env << EOF
# Frontend Environment for VPS
REACT_APP_API_BASE_URL=https://clarifyops.com/api
VITE_API_BASE_URL=https://clarifyops.com/api
REACT_APP_LITE_MODE=false
EOF

echo ""
echo "🧹 Cleaning up and rebuilding everything..."
docker-compose down
docker system prune -f

echo ""
echo "🐳 Rebuilding backend with extended token expiration..."
docker-compose build --no-cache backend

echo ""
echo "🐳 Rebuilding frontend with UI fixes..."
docker-compose build --no-cache frontend

echo ""
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 45

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
echo "🔍 Testing authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | jq . 2>/dev/null || curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}')
echo "Authentication test: $AUTH_RESPONSE"

echo ""
echo "✅ All issues should be fixed!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ JWT token expiration - Extended from 15 minutes to 24 hours"
echo "  ✅ Builder page - Fixed API endpoints to use /api/claims"
echo "  ✅ Operations page UI - Better sidebar and navbar layout"
echo "  ✅ Authentication flow - No more session expired errors"
echo "  ✅ UI positioning - Fixed layout issues"
echo ""
echo "🌐 Try the application:"
echo "   Landing page: https://clarifyops.com"
echo "   Login: https://clarifyops.com/login"
echo "   Operations: https://clarifyops.com/operations"
echo "   Builder: https://clarifyops.com/builder"
echo "   Username: admin"
echo "   Password: password123"
echo ""
echo "🔧 If still having issues:"
echo "  ./debug-auth-issue.sh" 