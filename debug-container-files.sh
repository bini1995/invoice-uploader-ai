#!/bin/bash

echo "🔍 Debugging Frontend Container Files"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Container status:"
docker ps --filter "name=clarifyops-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📁 Root directory contents:"
docker exec clarifyops-frontend ls -la /usr/share/nginx/html/

echo ""
echo "📁 Static directory contents:"
docker exec clarifyops-frontend ls -la /usr/share/nginx/html/static/ 2>/dev/null || echo "No static directory found"

echo ""
echo "📁 JS directory contents:"
docker exec clarifyops-frontend ls -la /usr/share/nginx/html/static/js/ 2>/dev/null || echo "No js directory found"

echo ""
echo "🔍 Finding all .js files:"
docker exec clarifyops-frontend find /usr/share/nginx/html/ -name "*.js" -type f

echo ""
echo "🔍 Finding all files with 'main' in name:"
docker exec clarifyops-frontend find /usr/share/nginx/html/ -name "*main*" -type f

echo ""
echo "🔍 Checking for localhost references in any .js files:"
docker exec clarifyops-frontend find /usr/share/nginx/html/ -name "*.js" -exec grep -l "localhost:3000" {} \; 2>/dev/null || echo "No localhost references found"

echo ""
echo "🔍 Checking for clarifyops.com references in any .js files:"
docker exec clarifyops-frontend find /usr/share/nginx/html/ -name "*.js" -exec grep -l "clarifyops.com" {} \; 2>/dev/null || echo "No clarifyops.com references found" 