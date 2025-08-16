#!/bin/bash

echo "🚀 Deploying ClarifyOps Lite Mode on VPS..."

# Stop existing containers if running
echo "📦 Stopping existing containers..."
docker-compose down

# Copy environment file
echo "📝 Setting up Lite mode environment..."
cp env.lite .env.lite

# Build and start Lite mode containers
echo "🐳 Building and starting Lite mode containers..."
docker-compose -f docker-compose.lite.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check container status
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Lite mode deployment complete!"
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