#!/bin/bash

echo "🚀 Deploying ClarifyOps Lite Mode on VPS..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

# Stop existing containers if running
echo "📦 Stopping existing containers..."
docker-compose down

# Copy environment file
echo "📝 Setting up Lite mode environment..."
cp env.lite.production .env.lite

# Create the Lite database if it doesn't exist
echo "🗄️ Setting up Lite database..."
docker run --rm -e POSTGRES_PASSWORD=TATA1tata1 -e POSTGRES_USER=postgres -e POSTGRES_DB=invoices_db_lite postgres:15 psql -h db -U postgres -c "CREATE DATABASE invoices_db_lite;" 2>/dev/null || echo "Database may already exist"

# Build and start Lite mode containers
echo "🐳 Building and starting Lite mode containers..."
docker-compose -f docker-compose.lite.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 15

# Check container status
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check if containers are running
if docker ps --filter "name=clarifyops-backend-lite" --format "{{.Names}}" | grep -q "clarifyops-backend-lite"; then
    echo ""
    echo "✅ Lite mode deployment successful!"
    echo ""
    echo "🌐 Access URLs:"
    echo "  Frontend: http://your-vps-ip:8080"
    echo "  Backend API: http://your-vps-ip:3000"
    echo "  Database: localhost:5433"
    echo ""
    echo "📋 Container names:"
    echo "  - clarifyops-backend-lite"
    echo "  - clarifyops-frontend-lite"
    echo "  - clarifyops-db-lite"
    echo "  - clarifyops-nginx-lite"
    echo ""
    echo "🔧 To check logs:"
    echo "  docker-compose -f docker-compose.lite.yml logs -f"
    echo ""
    echo "🛑 To stop:"
    echo "  docker-compose -f docker-compose.lite.yml down"
    echo ""
    echo "🔄 To switch back to full mode:"
    echo "  docker-compose -f docker-compose.lite.yml down"
    echo "  docker-compose up -d"
else
    echo ""
    echo "❌ Lite mode deployment failed!"
    echo "🔧 Check logs:"
    echo "  docker-compose -f docker-compose.lite.yml logs"
fi 