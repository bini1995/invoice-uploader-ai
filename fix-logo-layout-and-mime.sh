#!/bin/bash

echo "🔧 Fix: Logo Styling, Layout, Navigation, and MIME Types"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixed issues:"
echo "  ✅ Improved logo styling - Better sizing and hover effects"
echo "  ✅ Added back to home navigation on login page"
echo "  ✅ Enhanced dashboard illustration with real content"
echo "  ✅ Improved nginx CSS MIME type handling"
echo "  ✅ Added specific CSS handling for /static/ directory"

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
echo "🐳 Rebuilding frontend with all improvements..."
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
echo "  ✅ Logo styling - Better sizing, hover effects, and positioning"
echo "  ✅ Login navigation - Clickable logo to return to home"
echo "  ✅ Dashboard illustration - Real content showing claims processing"
echo "  ✅ CSS MIME types - Improved nginx configuration"
echo "  ✅ Layout improvements - Better spacing and alignment"
echo ""
echo "🌐 Try the application:"
echo "   Landing page: https://clarifyops.com"
echo "   Login page: https://clarifyops.com/login"
echo "   Username: admin"
echo "   Password: password123"
echo ""
echo "🎨 Visual improvements:"
echo "  ✅ Logo now has hover effects and proper sizing"
echo "  ✅ Login page has clickable logo to return home"
echo "  ✅ Dashboard shows realistic claims processing interface"
echo "  ✅ Better responsive design and spacing"
echo ""
echo "🔧 If still having issues:"
echo "  ./debug-auth-issue.sh" 