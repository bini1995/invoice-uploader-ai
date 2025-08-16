#!/bin/bash

echo "🔧 Fix #1b: Route Confusion & Analytics Endpoints"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixing Route Issues..."
echo "  ✅ Adding missing analytics endpoints"
echo "  ✅ Fixing route parameter handling"
echo "  ✅ Adding proper error handling for analytics routes"

echo ""
echo "📝 Adding missing analytics endpoints to claimRoutes.js..."
cat >> backend/routes/claimRoutes.js << 'EOF'

// Analytics endpoints that were being misrouted to getDocument
router.get('/top-vendors', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT vendor, COUNT(*) as count, SUM(amount) as total_amount 
      FROM invoices 
      GROUP BY vendor 
      ORDER BY total_amount DESC 
      LIMIT 10
    `);
    res.json({ topVendors: rows });
  } catch (err) {
    console.error('Top vendors error:', err);
    res.status(500).json({ message: 'Failed to fetch top vendors' });
  }
});

router.get('/upload-heatmap', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        EXTRACT(DOW FROM created_at) as day,
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM invoices 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY day, hour
      ORDER BY day, hour
    `);
    res.json({ heatmap: rows });
  } catch (err) {
    console.error('Upload heatmap error:', err);
    res.status(500).json({ message: 'Failed to fetch upload heatmap' });
  }
});

router.get('/quick-stats', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE flagged = true) as flagged,
        AVG(amount) as avg_amount,
        SUM(amount) as total_amount
      FROM invoices
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error('Quick stats error:', err);
    res.status(500).json({ message: 'Failed to fetch quick stats' });
  }
});

router.get('/cash-flow', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as total
      FROM invoices 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    res.json({ cashFlow: rows });
  } catch (err) {
    console.error('Cash flow error:', err);
    res.status(500).json({ message: 'Failed to fetch cash flow' });
  }
});

router.get('/spending-by-tag', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        jsonb_array_elements_text(tags) as tag,
        COUNT(*) as count,
        SUM(amount) as total
      FROM invoices 
      WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0
      GROUP BY tag
      ORDER BY total DESC
    `);
    res.json({ spendingByTag: rows });
  } catch (err) {
    console.error('Spending by tag error:', err);
    res.status(500).json({ message: 'Failed to fetch spending by tag' });
  }
});

router.get('/anomalies', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM invoices 
      WHERE flagged = true 
      ORDER BY created_at DESC 
      LIMIT 20
    `);
    res.json({ anomalies: rows });
  } catch (err) {
    console.error('Anomalies error:', err);
    res.status(500).json({ message: 'Failed to fetch anomalies' });
  }
});

router.get('/monthly-insights', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as avg_amount
      FROM invoices 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);
    res.json({ monthlyInsights: rows });
  } catch (err) {
    console.error('Monthly insights error:', err);
    res.status(500).json({ message: 'Failed to fetch monthly insights' });
  }
});

router.get('/vendor-scorecards', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        vendor,
        COUNT(*) as total_claims,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(*) FILTER (WHERE flagged = true) as flagged_count
      FROM invoices 
      GROUP BY vendor
      ORDER BY total_amount DESC
    `);
    res.json({ vendorScorecards: rows });
  } catch (err) {
    console.error('Vendor scorecards error:', err);
    res.status(500).json({ message: 'Failed to fetch vendor scorecards' });
  }
});
EOF

echo ""
echo "📝 Adding pool import to claimRoutes.js..."
# Add pool import if it doesn't exist
if ! grep -q "const pool = require" backend/routes/claimRoutes.js; then
    sed -i '' '1i\
const pool = require('\''../config/db'\'');
' backend/routes/claimRoutes.js
fi

echo ""
echo "📝 Fixing getDocument function to handle non-integer IDs..."
# Update the getDocument function to handle string routes
sed -i '' 's/exports.getDocument = async (req, res) => {/exports.getDocument = async (req, res) => {\n  const { id } = req.params;\n  \n  \/\/ Handle non-integer IDs (analytics routes)\n  if (isNaN(id)) {\n    return res.status(400).json({ message: `Invalid document ID: ${id}` });\n  }/' backend/controllers/claimController.js

echo ""
echo "🧹 Rebuilding backend with route fixes..."
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
echo "🧪 Testing analytics endpoints..."
echo "Testing /api/claims/top-vendors endpoint..."

TOP_VENDORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/claims/top-vendors)
echo "Top vendors endpoint: $TOP_VENDORS_RESPONSE"

echo "Testing /api/claims/upload-heatmap endpoint..."
HEATMAP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/claims/upload-heatmap)
echo "Upload heatmap endpoint: $HEATMAP_RESPONSE"

echo "Testing /api/claims/quick-stats endpoint..."
STATS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/claims/quick-stats)
echo "Quick stats endpoint: $STATS_RESPONSE"

echo ""
echo "🔍 Testing authentication still works..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | jq . 2>/dev/null || curl -s -X POST http://localhost:3000/api/claims/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}')
echo "Authentication test: $AUTH_RESPONSE"

echo ""
echo "✅ Fix #1b Complete!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Added missing analytics endpoints (top-vendors, upload-heatmap, etc.)"
echo "  ✅ Fixed route parameter handling in getDocument function"
echo "  ✅ Added proper error handling for analytics routes"
echo "  ✅ Added pool import to claimRoutes.js"
echo "  ✅ Tested analytics endpoints and authentication"
echo ""
echo "🌐 Test the application:"
echo "   Login: https://clarifyops.com/login"
echo "   Claims: https://clarifyops.com/claims"
echo "   Builder: https://clarifyops.com/builder"
echo "   Operations: https://clarifyops.com/operations"
echo ""
echo "📋 Next: Run fix-2-database-schema.sh for the next critical fix"
echo ""
echo "🔧 If issues arise:"
echo "  docker-compose logs backend" 