#!/bin/bash

# ClarifyOps Mode Switcher
# This script helps you switch between Lite and Full modes

show_help() {
    echo "🔄 ClarifyOps Mode Switcher"
    echo ""
    echo "Usage: $0 [lite|full|status]"
    echo ""
    echo "Commands:"
    echo "  lite    - Switch to Lite mode (for pilot customers)"
    echo "  full    - Switch to Full mode (for investors/enterprise)"
    echo "  status  - Show current mode and container status"
    echo ""
    echo "Examples:"
    echo "  $0 lite    # Deploy Lite mode"
    echo "  $0 full    # Deploy Full mode"
    echo "  $0 status  # Check current status"
}

check_status() {
    echo "📊 Current Status:"
    echo ""
    
    # Check if Lite mode is running
    if docker ps --filter "name=clarifyops-backend-lite" --format "{{.Names}}" | grep -q "clarifyops-backend-lite"; then
        echo "✅ Lite Mode: RUNNING"
        echo "   Frontend: http://your-vps-ip:8080"
        echo "   Backend: http://your-vps-ip:3000"
    else
        echo "❌ Lite Mode: NOT RUNNING"
    fi
    
    # Check if Full mode is running
    if docker ps --filter "name=clarifyops-backend" --format "{{.Names}}" | grep -q "clarifyops-backend"; then
        echo "✅ Full Mode: RUNNING"
        echo "   Frontend: http://your-vps-ip:80"
        echo "   Backend: http://your-vps-ip:3000"
    else
        echo "❌ Full Mode: NOT RUNNING"
    fi
    
    echo ""
    echo "📋 All ClarifyOps containers:"
    docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

switch_to_lite() {
    echo "🚀 Switching to Lite Mode..."
    
    # Stop full mode if running
    echo "📦 Stopping Full mode..."
    docker-compose down 2>/dev/null
    
    # Deploy Lite mode
    echo "🐳 Deploying Lite mode..."
    ./deploy-lite-vps.sh
    
    echo ""
    echo "✅ Switched to Lite Mode!"
    echo "🌐 Access at: http://your-vps-ip:8080"
}

switch_to_full() {
    echo "🚀 Switching to Full Mode..."
    
    # Stop Lite mode if running
    echo "📦 Stopping Lite mode..."
    docker-compose -f docker-compose.lite.yml down 2>/dev/null
    
    # Deploy Full mode
    echo "🐳 Deploying Full mode..."
    docker-compose up -d --build
    
    # Wait for containers to be ready
    echo "⏳ Waiting for containers to be ready..."
    sleep 10
    
    # Check status
    if docker ps --filter "name=clarifyops-backend" --format "{{.Names}}" | grep -q "clarifyops-backend"; then
        echo ""
        echo "✅ Switched to Full Mode!"
        echo "🌐 Access at: http://your-vps-ip:80"
    else
        echo ""
        echo "❌ Full Mode deployment failed!"
        echo "🔧 Check logs: docker-compose logs"
    fi
}

# Main script logic
case "$1" in
    "lite")
        switch_to_lite
        ;;
    "full")
        switch_to_full
        ;;
    "status")
        check_status
        ;;
    *)
        show_help
        ;;
esac 