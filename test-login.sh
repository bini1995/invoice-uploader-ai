#!/bin/bash

echo "🧪 Testing Login Functionality"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Checking if services are running..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Testing frontend accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
echo "Frontend (port 3001): $FRONTEND_STATUS"

echo ""
echo "🔌 Testing backend API accessibility..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
echo "Backend API (port 3000): $BACKEND_STATUS"

echo ""
echo "🌍 Testing external domain accessibility..."
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com)
echo "External domain: $EXTERNAL_STATUS"

echo ""
echo "🔍 Testing API endpoint directly..."
API_RESPONSE=$(curl -s https://clarifyops.com/api/health 2>/dev/null | head -c 100)
echo "API response: $API_RESPONSE"

echo ""
echo "🎯 Summary:"
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend not accessible"
fi

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend API is accessible"
else
    echo "❌ Backend API not accessible"
fi

if [ "$EXTERNAL_STATUS" = "200" ]; then
    echo "✅ External domain is accessible"
else
    echo "❌ External domain not accessible"
fi

echo ""
echo "🚀 Try logging in at: https://clarifyops.com"
echo "   If it works, you can switch to Lite mode with: ./switch-mode.sh lite" 