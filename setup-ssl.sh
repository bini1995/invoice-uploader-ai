#!/bin/bash

# SSL Setup Script for ClarifyOps
# This script sets up SSL certificates using Let's Encrypt

set -e

echo "🔒 Setting up SSL certificates for clarifyops.com..."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt update
    apt install -y certbot
fi

# Create directory for SSL certificates
mkdir -p /etc/letsencrypt

# Stop nginx temporarily to free up port 80
echo "🛑 Stopping nginx temporarily..."
docker-compose stop nginx

# Generate SSL certificate
echo "🎫 Generating SSL certificate..."
certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email admin@clarifyops.com \
    --agree-tos \
    --no-eff-email \
    -d clarifyops.com \
    -d www.clarifyops.com

# Check if certificate was generated successfully
if [ -f "/etc/letsencrypt/live/clarifyops.com/fullchain.pem" ]; then
    echo "✅ SSL certificate generated successfully!"
    
    # Set proper permissions
    chmod -R 755 /etc/letsencrypt/live/
    chmod -R 755 /etc/letsencrypt/archive/
    
    # Update nginx configuration to enable HTTPS
    echo "🔧 Updating nginx configuration..."
    
    # Uncomment the HTTPS server block in nginx.conf
    sed -i 's/# server {/server {/g' nginx/nginx.conf
    sed -i 's/#     listen 443 ssl http2;/    listen 443 ssl http2;/g' nginx/nginx.conf
    sed -i 's/#     server_name clarifyops.com www.clarifyops.com;/    server_name clarifyops.com www.clarifyssl_certificate_key/g' nginx/nginx.conf
    sed -i 's/#     ssl_certificate/    ssl_certificate/g' nginx/nginx.conf
    sed -i 's/#     ssl_certificate_key/    ssl_certificate_key/g' nginx/nginx.conf
    sed -i 's/#     ssl_protocols/    ssl_protocols/g' nginx/nginx.conf
    sed -i 's/#     ssl_ciphers/    ssl_ciphers/g' nginx/nginx.conf
    sed -i 's/#     ssl_prefer_server_ciphers/    ssl_prefer_server_ciphers/g' nginx/nginx.conf
    sed -i 's/#     ssl_session_cache/    ssl_session_cache/g' nginx/nginx.conf
    sed -i 's/#     ssl_session_timeout/    ssl_session_timeout/g' nginx/nginx.conf
    sed -i 's/#     add_header X-Frame-Options/    add_header X-Frame-Options/g' nginx/nginx.conf
    sed -i 's/#     add_header X-Content-Type-Options/    add_header X-Content-Type-Options/g' nginx/nginx.conf
    sed -i 's/#     add_header X-XSS-Protection/    add_header X-XSS-Protection/g' nginx/nginx.conf
    sed -i 's/#     add_header Referrer-Policy/    add_header Referrer-Policy/g' nginx/nginx.conf
    sed -i 's/#     add_header Strict-Transport-Security/    add_header Strict-Transport-Security/g' nginx/nginx.conf
    sed -i 's/#     location \/api\//    location \/api\//g' nginx/nginx.conf
    sed -i 's/#         proxy_pass/        proxy_pass/g' nginx/nginx.conf
    sed -i 's/#         proxy_http_version/        proxy_http_version/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header Upgrade/        proxy_set_header Upgrade/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header Connection/        proxy_set_header Connection/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header Host/        proxy_set_header Host/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header X-Real-IP/        proxy_set_header X-Real-IP/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header X-Forwarded-For/        proxy_set_header X-Forwarded-For/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header X-Forwarded-Proto/        proxy_set_header X-Forwarded-Proto/g' nginx/nginx.conf
    sed -i 's/#         proxy_cache_bypass/        proxy_cache_bypass/g' nginx/nginx.conf
    sed -i 's/#         proxy_read_timeout/        proxy_read_timeout/g' nginx/nginx.conf
    sed -i 's/#     location \//    location \//g' nginx/nginx.conf
    sed -i 's/#         proxy_pass/        proxy_pass/g' nginx/nginx.conf
    sed -i 's/#         proxy_http_version/        proxy_http_version/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header Upgrade/        proxy_set_header Upgrade/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header Connection/        proxy_set_header Connection/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header Host/        proxy_set_header Host/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header X-Real-IP/        proxy_set_header X-Real-IP/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header X-Forwarded-For/        proxy_set_header X-Forwarded-For/g' nginx/nginx.conf
    sed -i 's/#         proxy_set_header X-Forwarded-Proto/        proxy_set_header X-Forwarded-Proto/g' nginx/nginx.conf
    sed -i 's/#         proxy_cache_bypass/        proxy_set_header X-Forwarded-Proto/g' nginx/nginx.conf
    sed -i 's/#     location \/health/    location \/health/g' nginx/nginx.conf
    sed -i 's/#         access_log off;/        access_log off;/g' nginx/nginx.conf
    sed -i 's/#         return 200 "healthy\\n";/        return 200 "healthy\\n";/g' nginx/nginx.conf
    sed -i 's/#         add_header Content-Type text\/plain;/        add_header Content-Type text\/plain;/g' nginx/nginx.conf
    sed -i 's/# }/}/g' nginx/nginx.conf
    
    # Add HTTP to HTTPS redirect
    sed -i '/# HTTP server (temporary - will redirect to HTTPS once SSL is set up)/a\    # HTTP to HTTPS redirect\n    server {\n        listen 80;\n        server_name clarifyops.com www.clarifyops.com;\n        return 301 https://$server_name$request_uri;\n    }\n\n    # HTTPS server' nginx/nginx.conf
    
    # Remove the old HTTP server block
    sed -i '/# HTTP server (temporary - will redirect to HTTPS once SSL is set up)/,/^    }$/d' nginx/nginx.conf
    
    # Uncomment the SSL volume mount in docker-compose.yml
    sed -i 's/# - \/etc\/letsencrypt:\/etc\/letsencrypt:ro  # Temporarily commented out until SSL is set up/- \/etc\/letsencrypt:\/etc\/letsencrypt:ro/g' docker-compose.yml
    
    echo "✅ Nginx configuration updated!"
    
    # Restart nginx with new configuration
    echo "🔄 Restarting nginx with SSL configuration..."
    docker-compose up -d nginx
    
    echo "🎉 SSL setup complete! Your site should now work on HTTPS."
    echo "🔗 Test it: https://clarifyops.com"
    
else
    echo "❌ SSL certificate generation failed!"
    echo "🔄 Restarting nginx without SSL..."
    docker-compose up -d nginx
    exit 1
fi

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ SSL setup complete with auto-renewal configured!"
