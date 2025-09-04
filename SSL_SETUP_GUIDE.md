# SSL Setup Guide for ClarifyOps

This guide will help you set up SSL certificates to enable HTTPS on your ClarifyOps application.

## Prerequisites

- Domain name pointing to your VPS (clarifyops.com)
- Root access to your VPS
- Port 80 and 443 open on your VPS

## Step 1: Install Certbot

```bash
# Update package list
apt update

# Install certbot
apt install -y certbot
```

## Step 2: Generate SSL Certificate

```bash
# Stop nginx temporarily to free up port 80
docker-compose stop nginx

# Generate SSL certificate
certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email admin@clarifyops.com \
    --agree-tos \
    --no-eff-email \
    -d clarifyops.com \
    -d www.clarifyops.com
```

## Step 3: Update Nginx Configuration

After the certificate is generated, you need to:

1. **Uncomment the SSL volume mount** in `docker-compose.yml`:
   ```yaml
   volumes:
     - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
     - /etc/letsencrypt:/etc/letsencrypt:ro  # Uncomment this line
   ```

2. **Update nginx.conf** to enable HTTPS:
   - Remove the comment markers (`#`) from the HTTPS server block
   - Add HTTP to HTTPS redirect
   - Update the SSL certificate paths

## Step 4: Restart Services

```bash
# Restart nginx with new configuration
docker-compose up -d nginx

# Verify HTTPS is working
curl -I https://clarifyops.com
```

## Step 5: Set Up Auto-Renewal

```bash
# Add to crontab for automatic renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

## Alternative: Use the Automated Script

If you prefer, you can use the automated script:

```bash
# Make it executable (if not already)
chmod +x setup-ssl.sh

# Run the script
./setup-ssl.sh
```

## Troubleshooting

### Certificate Generation Fails
- Ensure port 80 is not in use
- Check that your domain resolves to the VPS IP
- Verify firewall allows port 80 and 443

### HTTPS Not Working After Setup
- Check nginx logs: `docker-compose logs nginx`
- Verify certificate paths in nginx.conf
- Ensure SSL volume is mounted in docker-compose.yml

### Mixed Content Errors
- Update frontend environment variables to use HTTPS
- Check for hardcoded HTTP URLs in your code

## Security Headers

The HTTPS configuration includes these security headers:
- `Strict-Transport-Security`: Forces HTTPS
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Basic XSS protection

## Testing

After setup, test these URLs:
- ✅ `https://clarifyops.com` (should redirect from HTTP)
- ✅ `https://clarifyops.com/api/health` (API endpoint)
- ✅ `https://clarifyops.com/claims` (frontend route)

## Maintenance

- Certificates auto-renew every 60 days
- Check renewal status: `certbot certificates`
- Manual renewal: `certbot renew`
