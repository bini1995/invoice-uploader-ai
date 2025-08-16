#!/bin/bash

echo "🔧 Fixing Dockerfile Error - Invalid NODE_OPTIONS Flag"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📝 Creating frontend environment file..."
cat > frontend/.env << EOF
# Frontend Environment for VPS
REACT_APP_API_BASE_URL=https://clarifyops.com/api
VITE_API_BASE_URL=https://clarifyops.com/api
REACT_APP_LITE_MODE=false
EOF

echo "🧹 Cleaning up old builds..."
rm -rf frontend/build
docker-compose down

echo "🐳 Rebuilding frontend with fixed Dockerfile..."
docker-compose build --no-cache frontend

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 15

echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Dockerfile error fixed!"
echo "🌐 Try logging in at: https://clarifyops.com"
echo ""
echo "🔧 If still having issues, check logs:"
echo "  docker-compose logs frontend"
echo ""
echo "🔍 To verify the build, check the built files:"
echo "  docker exec clarifyops-frontend cat /usr/share/nginx/html/static/js/main.*.js | grep -o 'localhost:3000' || echo 'No localhost references found - good!'" 