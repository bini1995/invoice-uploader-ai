# ClarifyOps Deployment Guide - DigitalOcean

## Server Details
- **Droplet IP**: 104.131.56.144
- **Domain**: clarifyops.com
- **OS**: Ubuntu 24.04 LTS

---

## Step 1: Configure DNS at GoDaddy

1. Log into your GoDaddy account
2. Go to **My Products** → **Domains** → **clarifyops.com** → **DNS**
3. Edit the **A Record** for `@` (or create one if it doesn't exist):
   - **Type**: A
   - **Name**: @
   - **Value**: 104.131.56.144
   - **TTL**: 600 (or default)
4. Add another A record for `www`:
   - **Type**: A
   - **Name**: www
   - **Value**: 104.131.56.144
   - **TTL**: 600
5. Save changes and wait 5-15 minutes for DNS propagation

---

## Step 2: Set Up the Droplet

SSH into your droplet and run these commands:

```bash
# SSH into droplet
ssh root@104.131.56.144
```

### Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install nginx
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install PM2 (process manager)
npm install -g pm2

# Install git
apt install -y git
```

### Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands:
CREATE USER clarifyops WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE clarifyops_db;
GRANT ALL PRIVILEGES ON DATABASE clarifyops_db TO clarifyops;
\c clarifyops_db
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### Clone and Set Up Application

```bash
# Create app directory
mkdir -p /var/www/clarifyops
cd /var/www/clarifyops

# Option A: Clone from Git (if you have a repo)
# git clone https://github.com/your-repo/clarifyops.git .

# Option B: Upload files via SCP from your local machine
# (run this from your local machine, not the server)
# scp -r ./backend ./frontend root@104.131.56.144:/var/www/clarifyops/

# Install backend dependencies
cd /var/www/clarifyops/backend
npm install --production

# Create uploads directory
mkdir -p uploads/documents
```

### Configure Environment Variables

```bash
# Create environment file
cat > /var/www/clarifyops/backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://clarifyops:your_secure_password_here@localhost:5432/clarifyops_db
JWT_SECRET=your_very_long_random_jwt_secret_here_at_least_32_chars
OPENROUTER_API_KEY=your_openrouter_api_key
CORS_ORIGIN=https://clarifyops.com
EOF
```

### Configure nginx

```bash
# Create nginx config
cat > /etc/nginx/sites-available/clarifyops << 'EOF'
server {
    listen 80;
    server_name clarifyops.com www.clarifyops.com;

    # Frontend static files
    location / {
        root /var/www/clarifyops/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/clarifyops /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx
```

### Set Up SSL with Let's Encrypt

```bash
# Get SSL certificate (run after DNS is pointing to your server)
certbot --nginx -d clarifyops.com -d www.clarifyops.com
```

### Start the Application

```bash
# Navigate to backend
cd /var/www/clarifyops/backend

# Initialize database
node -e "import('./config/db.js').then(db => db.initializeDatabase())"

# Start with PM2
pm2 start app.js --name clarifyops-backend
pm2 save
pm2 startup
```

---

## Step 3: Transfer Files from Replit

You have two options to transfer the code:

### Option A: Using Git (Recommended)
If you have a GitHub repo, push from Replit and pull on the server.

### Option B: Using SCP
From your local machine with the Replit code downloaded:
```bash
scp -r backend root@104.131.56.144:/var/www/clarifyops/
scp -r frontend/dist root@104.131.56.144:/var/www/clarifyops/frontend/
```

### Option C: Using rsync (better for large transfers)
```bash
rsync -avz --progress backend root@104.131.56.144:/var/www/clarifyops/
rsync -avz --progress frontend/dist root@104.131.56.144:/var/www/clarifyops/frontend/
```

---

## Verification

1. Visit http://clarifyops.com - you should see the landing page
2. Visit https://clarifyops.com - SSL should be working
3. Try logging in with admin/password123

---

## Troubleshooting

### Check application logs
```bash
pm2 logs clarifyops-backend
```

### Check nginx logs
```bash
tail -f /var/log/nginx/error.log
```

### Restart services
```bash
pm2 restart clarifyops-backend
systemctl restart nginx
```

### Check if services are running
```bash
pm2 status
systemctl status nginx
systemctl status postgresql
```
