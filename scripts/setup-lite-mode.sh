#!/bin/bash

# ClarifyOps Lite Mode Setup Script
# This script sets up the environment for Lite mode deployment

echo "🚀 Setting up ClarifyOps Lite Mode..."

# Create Lite mode environment file
echo "📝 Creating Lite mode environment configuration..."

cat > .env.lite << EOF
# ClarifyOps Lite Mode Configuration
# For pilot customers - simplified version

# Frontend Configuration
REACT_APP_LITE_MODE=true
REACT_APP_DEMO_MODE=false
REACT_APP_SHOW_UPGRADE_PROMPTS=true
REACT_APP_FEATURE_TOUR=false

# Backend Configuration
LITE_MODE=true
NODE_ENV=production

# Database Configuration
DATABASE_URL=\${DATABASE_URL}

# AI Configuration
OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}

# Security Configuration
JWT_SECRET=\${JWT_SECRET}
DATA_ENCRYPTION_KEY=\${DATA_ENCRYPTION_KEY}

# Feature Flags
ENABLE_FRAUD_DETECTION=false
ENABLE_AI_EXPLAINABILITY=false
ENABLE_ADVANCED_WORKFLOWS=false
ENABLE_VENDOR_PROFILES=false
ENABLE_MULTI_TENANT=false

# Usage Limits (Lite Mode)
MAX_CLAIMS_PER_MONTH=1000
MAX_USERS=5
MAX_EXPORTS_PER_MONTH=50
EOF

# Create Full mode environment file
echo "📝 Creating Full mode environment configuration..."

cat > .env.full << EOF
# ClarifyOps Full Mode Configuration
# For investors and enterprise customers

# Frontend Configuration
REACT_APP_LITE_MODE=false
REACT_APP_DEMO_MODE=false
REACT_APP_SHOW_UPGRADE_PROMPTS=false
REACT_APP_FEATURE_TOUR=true

# Backend Configuration
LITE_MODE=false
NODE_ENV=production

# Database Configuration
DATABASE_URL=\${DATABASE_URL}

# AI Configuration
OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}

# Security Configuration
JWT_SECRET=\${JWT_SECRET}
DATA_ENCRYPTION_KEY=\${DATA_ENCRYPTION_KEY}

# Feature Flags
ENABLE_FRAUD_DETECTION=true
ENABLE_AI_EXPLAINABILITY=true
ENABLE_ADVANCED_WORKFLOWS=true
ENABLE_VENDOR_PROFILES=true
ENABLE_MULTI_TENANT=true

# Usage Limits (Full Mode)
MAX_CLAIMS_PER_MONTH=10000
MAX_USERS=50
MAX_EXPORTS_PER_MONTH=500
EOF

# Create Demo mode environment file
echo "📝 Creating Demo mode environment configuration..."

cat > .env.demo << EOF
# ClarifyOps Demo Mode Configuration
# For testing and demonstrations

# Frontend Configuration
REACT_APP_LITE_MODE=false
REACT_APP_DEMO_MODE=true
REACT_APP_SHOW_UPGRADE_PROMPTS=false
REACT_APP_FEATURE_TOUR=true

# Backend Configuration
LITE_MODE=false
NODE_ENV=development

# Database Configuration
DATABASE_URL=\${DATABASE_URL}

# AI Configuration
OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}

# Security Configuration
JWT_SECRET=\${JWT_SECRET}
DATA_ENCRYPTION_KEY=\${DATA_ENCRYPTION_KEY}

# Feature Flags
ENABLE_FRAUD_DETECTION=true
ENABLE_AI_EXPLAINABILITY=true
ENABLE_ADVANCED_WORKFLOWS=true
ENABLE_VENDOR_PROFILES=true
ENABLE_MULTI_TENANT=true

# Usage Limits (Demo Mode)
MAX_CLAIMS_PER_MONTH=100
MAX_USERS=3
MAX_EXPORTS_PER_MONTH=10
EOF

# Create Docker Compose files for different modes
echo "🐳 Creating Docker Compose configurations..."

cat > docker-compose.lite.yml << EOF
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - REACT_APP_LITE_MODE=true
      - REACT_APP_DEMO_MODE=false
      - REACT_APP_SHOW_UPGRADE_PROMPTS=true
    ports:
      - "3001:3001"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - LITE_MODE=true
      - NODE_ENV=production
    env_file:
      - .env.lite
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: clarifyops_lite
      POSTGRES_USER: clarifyops
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
EOF

cat > docker-compose.full.yml << EOF
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - REACT_APP_LITE_MODE=false
      - REACT_APP_DEMO_MODE=false
      - REACT_APP_SHOW_UPGRADE_PROMPTS=false
    ports:
      - "3002:3001"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - LITE_MODE=false
      - NODE_ENV=production
    env_file:
      - .env.full
    ports:
      - "3003:3000"
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: clarifyops_full
      POSTGRES_USER: clarifyops
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data_full:/var/lib/postgresql/data
    ports:
      - "5433:5432"

volumes:
  postgres_data_full:
EOF

# Create deployment scripts
echo "📜 Creating deployment scripts..."

cat > deploy-lite.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying ClarifyOps Lite Mode..."
docker-compose -f docker-compose.lite.yml up -d
echo "✅ Lite mode deployed at http://localhost:3001"
echo "📊 Backend API at http://localhost:3000"
EOF

cat > deploy-full.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying ClarifyOps Full Mode..."
docker-compose -f docker-compose.full.yml up -d
echo "✅ Full mode deployed at http://localhost:3002"
echo "📊 Backend API at http://localhost:3003"
EOF

cat > deploy-demo.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying ClarifyOps Demo Mode..."
cp .env.demo .env
npm run dev
echo "✅ Demo mode deployed at http://localhost:3001"
EOF

# Make scripts executable
chmod +x deploy-lite.sh deploy-full.sh deploy-demo.sh

# Create README for deployment
cat > DEPLOYMENT_README.md << 'EOF'
# ClarifyOps Deployment Guide

## Quick Start

### Lite Mode (Pilot Customers)
```bash
./deploy-lite.sh
```
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Database: localhost:5432

### Full Mode (Investors/Enterprise)
```bash
./deploy-full.sh
```
- Frontend: http://localhost:3002
- Backend: http://localhost:3003
- Database: localhost:5433

### Demo Mode (Testing)
```bash
./deploy-demo.sh
```
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

## Environment Variables

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENROUTER_API_KEY`: AI API key
- `JWT_SECRET`: JWT signing secret
- `DATA_ENCRYPTION_KEY`: Data encryption key

### Optional Variables
- `DB_PASSWORD`: Database password (for Docker)

## Feature Comparison

| Feature | Lite | Full | Demo |
|---------|------|------|------|
| Upload Claims | ✅ | ✅ | ✅ |
| AI Extraction | ✅ | ✅ | ✅ |
| Basic Validation | ✅ | ✅ | ✅ |
| Fraud Detection | ❌ | ✅ | ✅ |
| AI Explainability | ❌ | ✅ | ✅ |
| Advanced Workflows | ❌ | ✅ | ✅ |
| Multi-tenant | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |

## Stopping Services

```bash
# Stop Lite mode
docker-compose -f docker-compose.lite.yml down

# Stop Full mode
docker-compose -f docker-compose.full.yml down

# Stop Demo mode
pkill -f "npm run dev"
```
EOF

echo "✅ Setup complete!"
echo ""
echo "📁 Created files:"
echo "  - .env.lite (Lite mode configuration)"
echo "  - .env.full (Full mode configuration)"
echo "  - .env.demo (Demo mode configuration)"
echo "  - docker-compose.lite.yml (Lite mode Docker setup)"
echo "  - docker-compose.full.yml (Full mode Docker setup)"
echo "  - deploy-lite.sh (Lite mode deployment script)"
echo "  - deploy-full.sh (Full mode deployment script)"
echo "  - deploy-demo.sh (Demo mode deployment script)"
echo "  - DEPLOYMENT_README.md (Deployment guide)"
echo ""
echo "🚀 To deploy:"
echo "  Lite mode:   ./deploy-lite.sh"
echo "  Full mode:   ./deploy-full.sh"
echo "  Demo mode:   ./deploy-demo.sh"
echo ""
echo "📖 See DEPLOYMENT_README.md for detailed instructions" 