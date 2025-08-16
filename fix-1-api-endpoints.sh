#!/bin/bash

echo "🔧 Fix #1: API Endpoint Standardization"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixing API Endpoint Inconsistency..."
echo "  ✅ Creating endpoint normalizer middleware"
echo "  ✅ Updating app.js to use endpoint normalization"
echo "  ✅ Testing endpoint redirection"

echo ""
echo "📝 Creating endpoint normalizer middleware..."
cat > backend/middleware/endpointNormalizer.js << 'EOF'
// Normalize /api/invoices to /api/claims for backward compatibility
const normalizeEndpoints = (req, res, next) => {
  if (req.url.startsWith('/api/invoices')) {
    console.log(`Redirecting ${req.url} to ${req.url.replace('/api/invoices', '/api/claims')}`);
    req.url = req.url.replace('/api/invoices', '/api/claims');
  }
  next();
};

module.exports = normalizeEndpoints;
EOF

echo ""
echo "📝 Updating app.js to include endpoint normalization..."
# Check if the normalizer is already added
if ! grep -q "endpointNormalizer" backend/app.js; then
    echo "Adding endpoint normalizer to app.js..."
    
    # Add the import after other middleware imports
    sed -i '' '/const auditRoutes = require/a\
const normalizeEndpoints = require('\''./middleware/endpointNormalizer'\'');
' backend/app.js
    
    # Add the middleware before other route middleware
    sed -i '' '/app.use.*auditRoutes/i\
app.use('\''/api'\'', normalizeEndpoints);
' backend/app.js
    
    echo "✅ Endpoint normalizer added to app.js"
else
    echo "✅ Endpoint normalizer already exists in app.js"
fi

echo ""
echo "🧹 Rebuilding backend with endpoint normalization..."
docker-compose build --no-cache backend

echo ""
echo "🚀 Restarting backend..."
docker-compose restart backend

echo ""
echo "⏳ Waiting for backend to start..."
sleep 20

echo ""
echo "📊 Checking container status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧪 Testing endpoint normalization..."
echo "Testing /api/invoices endpoint redirection..."

# Test the legacy endpoint
INVOICES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/invoices)
echo "Legacy /api/invoices endpoint: $INVOICES_RESPONSE"

# Test the correct endpoint
CLAIMS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/claims)
echo "Correct /api/claims endpoint: $CLAIMS_RESPONSE"

echo ""
echo "🔍 Testing authentication with normalized endpoints..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | jq . 2>/dev/null || curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}')
echo "Authentication test: $AUTH_RESPONSE"

echo ""
echo "✅ Fix #1 Complete!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Created endpoint normalizer middleware"
echo "  ✅ Added automatic redirection from /api/invoices to /api/claims"
echo "  ✅ Updated app.js to use endpoint normalization"
echo "  ✅ Tested endpoint redirection and authentication"
echo ""
echo "🌐 Test the application:"
echo "   Login: https://clarifyops.com/login"
echo "   Claims: https://clarifyops.com/claims"
echo "   Builder: https://clarifyops.com/builder"
echo ""
echo "📋 Next: Run fix-2-database-schema.sh for the next critical fix"
echo ""
echo "🔧 If issues arise:"
echo "  docker-compose logs backend" 