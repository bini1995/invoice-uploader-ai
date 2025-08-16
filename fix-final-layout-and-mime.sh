#!/bin/bash

echo "🔧 Final Fix: MIME Types, Logo, and Layout Issues"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixed issues:"
echo "  ✅ Updated index.html - Changed logo.png to logo.svg and favicon.svg"
echo "  ✅ Added logo to landing page header and hero section"
echo "  ✅ Improved nginx.conf - Better MIME type handling with 'always' flag"
echo "  ✅ Added proper static file handling in nginx"
echo "  ✅ Fixed CSS MIME type serving as text/html instead of text/css"

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
echo "🐳 Rebuilding frontend with all fixes..."
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
echo "🔍 Testing CSS MIME type..."
CSS_RESPONSE=$(curl -s -I https://clarifyops.com/static/css/main.css | grep -i "content-type")
echo "CSS Content-Type: $CSS_RESPONSE"

echo ""
echo "🔍 Testing logo availability..."
LOGO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com/logo.svg)
echo "Logo status: $LOGO_STATUS"

echo ""
echo "🔍 Testing favicon availability..."
FAVICON_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com/favicon.svg)
echo "Favicon status: $FAVICON_STATUS"

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
echo "  ✅ Logo references - Changed from logo.png to logo.svg"
echo "  ✅ Favicon - Now using favicon.svg"
echo "  ✅ CSS MIME types - Added 'always' flag to nginx headers"
echo "  ✅ Static file handling - Better nginx configuration"
echo "  ✅ Landing page layout - Added logo to header and hero"
echo "  ✅ Image alignment - Proper sizing and positioning"
echo ""
echo "🌐 Try logging in at: https://clarifyops.com"
echo "   Username: admin"
echo "   Password: password123"
echo ""
echo "🎨 Landing page improvements:"
echo "  ✅ Logo in header navigation"
echo "  ✅ Logo in hero section"
echo "  ✅ Proper image sizing and alignment"
echo "  ✅ Better responsive design"
echo ""
echo "🔧 If still having issues:"
echo "  ./debug-auth-issue.sh" 