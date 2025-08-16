#!/bin/bash

echo "🔍 Debugging Authentication Issue"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Testing backend authentication..."
echo "Testing health endpoint:"
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health

echo ""
echo "Testing login endpoint directly:"
curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq . 2>/dev/null || curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

echo ""
echo "🔍 Checking backend logs for authentication errors..."
echo "Last 20 lines of backend logs:"
docker-compose logs --tail=20 backend

echo ""
echo "🔍 Checking frontend logs..."
echo "Last 10 lines of frontend logs:"
docker-compose logs --tail=10 frontend

echo ""
echo "🔍 Testing external domain:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://clarifyops.com

echo ""
echo "🔍 Testing API through external domain:"
curl -s https://clarifyops.com/api/health | jq . 2>/dev/null || curl -s https://clarifyops.com/api/health

echo ""
echo "🎯 Summary:"
echo "  - Check if backend is responding to login requests"
echo "  - Check if there are authentication errors in logs"
echo "  - Check if MIME type issues are resolved"
echo ""
echo "🔧 Next steps:"
echo "  1. If backend login works, the issue is in frontend"
echo "  2. If backend login fails, check database and user setup"
echo "  3. If MIME types still wrong, rebuild frontend" 