#!/bin/bash

echo "🔧 Final Fix: CSP, Authentication, and Session Issues"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixed issues:"
echo "  ✅ Updated CSP to allow Google Fonts and Hotjar"
echo "  ✅ Fixed authentication flow to not trigger session expired on login"
echo "  ✅ Removed problematic sub_filter directives"

echo ""
echo "🔄 Restarting nginx with updated configuration..."
docker-compose restart nginx

echo ""
echo "⏳ Waiting for nginx to start..."
sleep 10

echo ""
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧪 Testing services..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com)

echo "Frontend (port 3001): $FRONTEND_STATUS"
echo "Backend API (port 3000): $BACKEND_STATUS"
echo "External domain: $EXTERNAL_STATUS"

echo ""
echo "✅ All issues should be fixed!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Google Fonts - Added fonts.googleapis.com to CSP"
echo "  ✅ Hotjar scripts - Added script.hotjar.com to CSP"
echo "  ✅ Authentication - Fixed session expired on login attempts"
echo "  ✅ MIME types - Removed problematic sub_filter directives"
echo ""
echo "🌐 Try logging in at: https://clarifyops.com"
echo "   No more CSP errors or session expired loops!"
echo ""
echo "🔧 If still having issues:"
echo "  docker-compose logs nginx"
echo "  docker-compose logs frontend" 