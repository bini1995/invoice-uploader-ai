#!/bin/bash

echo "🚀 Deploy with Local Build (to avoid VPS memory constraints)"

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

echo "🔍 Verifying build..."
if grep -r "localhost:3000" frontend/build/ > /dev/null 2>&1; then
    echo "❌ Warning: localhost references found in build!"
    echo "   This means the environment variables weren't properly injected."
else
    echo "✅ No localhost references found - build looks good!"
fi

echo ""
echo "📦 Build completed! Files are in frontend/build/"
echo ""
echo "🚀 To deploy to VPS:"
echo "  1. Copy the build folder to your VPS:"
echo "     scp -r frontend/build root@your-vps-ip:~/invoice-uploader-ai/frontend/"
echo "  2. SSH into VPS and run:"
echo "     cd ~/invoice-uploader-ai"
echo "     docker-compose up -d"
echo ""
echo "🔧 Alternative: Use the simple Dockerfile on VPS:"
echo "  1. On VPS, rename: mv frontend/Dockerfile frontend/Dockerfile.complex"
echo "  2. Copy simple version: cp frontend/Dockerfile.simple frontend/Dockerfile"
echo "  3. Run: docker-compose up -d" 