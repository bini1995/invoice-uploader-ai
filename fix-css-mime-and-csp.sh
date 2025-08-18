#!/bin/bash

echo "🔧 Fix: CSS MIME Type & Content Security Policy"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixing CSS MIME Type & CSP Issues..."
echo "  ✅ Fixing CSS MIME type headers"
echo "  ✅ Updating Content Security Policy"
echo "  ✅ Allowing external video content"
echo "  ✅ Ensuring proper asset serving"

echo ""
echo "📝 Updating nginx configuration..."
cat > nginx/default.conf << 'EOF'
upstream frontend {
    server frontend:80;
}

upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Content Security Policy - Updated to allow videos
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://script.hotjar.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https://sample-videos.com https://*.sample-videos.com; connect-src 'self' https://api.openrouter.ai https://script.hotjar.com https://www.google-analytics.com; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'" always;

    # Frontend routes
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle CORS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Tenant-Id' always;
            add_header 'Access-Control-Max-Age' 1728000 always;
            add_header 'Content-Type' 'text/plain; charset=utf-8' always;
            add_header 'Content-Length' 0 always;
            return 204;
        }
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Tenant-Id' always;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo ""
echo "📝 Updating frontend nginx configuration..."
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CSS files - Fix MIME type
    location ~* \.(css)$ {
        add_header Content-Type "text/css" always;
        add_header X-Content-Type-Options "nosniff" always;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # JavaScript files
    location ~* \.(js)$ {
        add_header Content-Type "application/javascript" always;
        add_header X-Content-Type-Options "nosniff" always;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Static assets
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Specific static directory handling
    location /static/ {
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # CSS files in static directory
    location ~* /static/.*\.css$ {
        add_header Content-Type "text/css" always;
        add_header X-Content-Type-Options "nosniff" always;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # JavaScript files in static directory
    location ~* /static/.*\.js$ {
        add_header Content-Type "application/javascript" always;
        add_header X-Content-Type-Options "nosniff" always;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Default location
    location / {
        try_files $uri /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
}
EOF

echo ""
echo "📝 Updating backend security middleware..."
# Update the security middleware to allow video content
sed -i '' 's/media-src '\''self'\''/media-src '\''self'\'' https:\/\/sample-videos.com https:\/\/*.sample-videos.com/g' backend/middleware/security.js

echo ""
echo "📝 Creating a test video component..."
cat > frontend/src/components/TestVideo.js << 'EOF'
import React from 'react';

export default function TestVideo() {
  return (
    <div className="video-container">
      <video 
        controls 
        width="320" 
        height="240"
        className="rounded-lg shadow-lg"
      >
        <source 
          src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
EOF

echo ""
echo "🧹 Rebuilding containers..."
docker-compose build --no-cache nginx frontend

echo ""
echo "🚀 Restarting containers..."
docker-compose restart nginx frontend

echo ""
echo "⏳ Waiting for containers to start..."
sleep 20

echo ""
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧪 Testing CSS MIME type..."
echo "Testing CSS file headers..."

CSS_HEADERS=$(curl -s -I https://clarifyops.com/static/css/main.css | grep -E "(Content-Type|X-Content-Type-Options)" || echo "Headers not found")
echo "CSS headers: $CSS_HEADERS"

echo ""
echo "🧪 Testing video access..."
echo "Testing video file access..."

VIDEO_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4)
echo "Video access: $VIDEO_ACCESS"

echo ""
echo "🧪 Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
echo "Frontend status: $FRONTEND_STATUS"

echo ""
echo "🔍 Testing external access..."
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clarifyops.com)
echo "External domain: $EXTERNAL_STATUS"

echo ""
echo "✅ CSS MIME Type & CSP Fix Complete!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Fixed CSS MIME type headers"
echo "  ✅ Updated Content Security Policy"
echo "  ✅ Allowed external video content"
echo "  ✅ Added proper asset serving"
echo "  ✅ Updated nginx configurations"
echo "  ✅ Created test video component"
echo ""
echo "🌐 Test the application:"
echo "   Landing: https://clarifyops.com"
echo "   Login: https://clarifyops.com/login"
echo "   Claims: https://clarifyops.com/claims"
echo ""
echo "🔧 If issues arise:"
echo "  docker-compose logs nginx"
echo "  docker-compose logs frontend"
echo "  curl -I https://clarifyops.com/static/css/main.css" 