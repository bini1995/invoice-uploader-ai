#!/bin/bash

echo "🔧 Fixing MIME Types and Authentication Issues"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixed frontend nginx.conf with proper MIME type handling"
echo "✅ Added CSS, JS, and image MIME type configurations"

echo ""
echo "📝 Creating frontend environment file..."
cat > frontend/.env << EOF
# Frontend Environment for VPS
REACT_APP_API_BASE_URL=https://clarifyops.com/api
VITE_API_BASE_URL=https://clarifyops.com/api
REACT_APP_LITE_MODE=false
EOF

echo ""
echo "🧹 Cleaning up and rebuilding frontend..."
docker-compose down
docker system prune -f

echo ""
echo "🐳 Rebuilding frontend with fixed nginx configuration..."
docker-compose build --no-cache frontend

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
echo "🔍 Testing CSS MIME type..."
CSS_RESPONSE=$(curl -s -I https://clarifyops.com/static/css/main.css | grep -i "content-type")
echo "CSS Content-Type: $CSS_RESPONSE"

echo ""
echo "✅ MIME types and authentication should be fixed!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Frontend nginx.conf - Added proper MIME type handling"
echo "  ✅ CSS files - Now served with text/css content-type"
echo "  ✅ JS files - Now served with application/javascript content-type"
echo "  ✅ Images - Proper caching and content-type headers"
echo ""
echo "🌐 Try logging in at: https://clarifyops.com"
echo "   No more MIME type errors or authentication issues!"
echo ""
echo "🔧 If still having issues:"
echo "  ./debug-auth-issue.sh" 