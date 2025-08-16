#!/bin/bash

echo "🔍 Checking if Frontend Build Actually Succeeded"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Checking container status..."
docker ps --filter "name=clarifyops-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Checking if build files exist in container..."
if docker exec clarifyops-frontend ls -la /usr/share/nginx/html/ | grep -q "static"; then
    echo "✅ Static files found in container!"
else
    echo "❌ No static files found in container"
    exit 1
fi

echo ""
echo "🔍 Checking for localhost references in built files..."
if docker exec clarifyops-frontend cat /usr/share/nginx/html/static/js/main.*.js | grep -o 'localhost:3000' > /dev/null 2>&1; then
    echo "❌ localhost references found - build didn't work properly"
else
    echo "✅ No localhost references found - build worked!"
fi

echo ""
echo "🔍 Checking for correct API endpoints..."
if docker exec clarifyops-frontend cat /usr/share/nginx/html/static/js/main.*.js | grep -o 'clarifyops.com' > /dev/null 2>&1; then
    echo "✅ clarifyops.com references found - environment variables injected correctly!"
else
    echo "⚠️  No clarifyops.com references found"
fi

echo ""
echo "🌐 Testing frontend access..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "✅ Frontend is accessible on port 3001"
else
    echo "❌ Frontend not accessible on port 3001"
fi

echo ""
echo "🎯 Summary:"
echo "  - Build files: $(docker exec clarifyops-frontend ls -la /usr/share/nginx/html/static/js/ | wc -l) files"
echo "  - Container status: $(docker ps --filter "name=clarifyops-frontend" --format "{{.Status}}")"
echo "  - Try logging in at: https://clarifyops.com" 