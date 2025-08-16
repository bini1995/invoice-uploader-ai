#!/bin/bash

echo "🔧 Building Frontend Locally (to avoid VPS memory constraints)"

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

echo "🐳 Building frontend locally with increased memory..."
cd frontend
NODE_OPTIONS="--max-old-space-size=4096" npm run build
cd ..

echo "✅ Frontend built successfully!"
echo "📦 Build files are in frontend/build/"
echo ""
echo "🚀 To deploy to VPS:"
echo "  1. Copy the build folder to your VPS"
echo "  2. Run: docker-compose up -d"
echo ""
echo "🔍 To verify the build locally:"
echo "  grep -r 'localhost:3000' frontend/build/ || echo 'No localhost references found - good!'" 