#!/bin/bash

echo "🔧 Fixing Login Issue..."

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

echo "🐳 Rebuilding frontend container..."
docker-compose build frontend

echo "🔄 Restarting frontend..."
docker-compose up -d frontend

echo "⏳ Waiting for frontend to be ready..."
sleep 10

echo "✅ Login issue should be fixed!"
echo "🌐 Try logging in at: https://clarifyops.com"
echo ""
echo "🔧 If still having issues, check logs:"
echo "  docker-compose logs frontend" 