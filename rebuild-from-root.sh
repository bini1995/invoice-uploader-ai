#!/bin/bash

echo "🚀 Rebuilding from Root Directory (with disk space optimization)"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory (not frontend/)"
    exit 1
fi

echo "📊 Checking disk space..."
df -h

echo "🧹 Cleaning up Docker cache and old builds..."
docker system prune -f
rm -rf frontend/build

echo "📝 Creating frontend environment file..."
cat > frontend/.env << EOF
# Frontend Environment for VPS
REACT_APP_API_BASE_URL=https://clarifyops.com/api
VITE_API_BASE_URL=https://clarifyops.com/api
REACT_APP_LITE_MODE=false
EOF

echo "🐳 Stopping all containers..."
docker-compose down

echo "🐳 Rebuilding frontend with disk space optimization..."
docker-compose build --no-cache frontend

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 20

echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Rebuild completed!"
echo "🌐 Try logging in at: https://clarifyops.com"
echo ""
echo "🔧 If still having issues, check logs:"
echo "  docker-compose logs frontend"
echo ""
echo "🔍 To verify the build:"
echo "  ./test-login.sh" 