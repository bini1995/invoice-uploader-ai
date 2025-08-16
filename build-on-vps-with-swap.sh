#!/bin/bash

echo "🚀 Building Frontend on VPS with Swap Space"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

# Check swap space
echo "📊 Checking memory and swap..."
free -h

# Check if swap is active
if ! swapon --show | grep -q "swapfile"; then
    echo "⚠️  Warning: Swap might not be active. Activating..."
    sudo swapon /swapfile 2>/dev/null || echo "Swap already active or not found"
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

echo "🐳 Building frontend with optimized memory settings..."
# Set Docker build memory limit and use swap
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with memory optimization
docker-compose build --no-cache --progress=plain frontend

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 20

echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Build completed!"
echo "🌐 Try logging in at: https://clarifyops.com"
echo ""
echo "🔧 If still having issues, check logs:"
echo "  docker-compose logs frontend"
echo ""
echo "🔍 To verify the build, check the built files:"
echo "  docker exec clarifyops-frontend cat /usr/share/nginx/html/static/js/main.*.js | grep -o 'localhost:3000' || echo 'No localhost references found - good!'" 