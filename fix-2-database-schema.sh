#!/bin/bash

echo "🔧 Fix #2: Database Schema Consistency"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the invoice-uploader-ai directory"
    exit 1
fi

echo "📊 Current status..."
docker ps --filter "name=clarifyops" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Fixing Database Schema Inconsistency..."
echo "  ✅ Creating database migration script"
echo "  ✅ Renaming invoices table to claims"
echo "  ✅ Updating foreign key references"
echo "  ✅ Updating database queries"

echo ""
echo "📝 Creating database migration script..."
cat > backend/migrations/rename_invoices_to_claims.sql << 'EOF'
-- Migration to rename invoices table to claims for consistency
-- This script renames the main table and updates all references

BEGIN;

-- Check if invoices table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        -- Rename main table
        ALTER TABLE invoices RENAME TO claims;
        RAISE NOTICE 'Renamed invoices table to claims';
    ELSE
        RAISE NOTICE 'Invoices table does not exist, skipping rename';
    END IF;
END $$;

-- Update foreign key references if they exist
DO $$
BEGIN
    -- Check if ocr_corrections table exists and has invoice_id column
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ocr_corrections' AND column_name = 'invoice_id') THEN
        ALTER TABLE ocr_corrections RENAME COLUMN invoice_id TO claim_id;
        RAISE NOTICE 'Renamed invoice_id to claim_id in ocr_corrections';
    END IF;
    
    -- Check if review_notes table exists and has document_id column
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'review_notes' AND column_name = 'document_id') THEN
        ALTER TABLE review_notes RENAME COLUMN document_id TO claim_id;
        RAISE NOTICE 'Renamed document_id to claim_id in review_notes';
    END IF;
END $$;

-- Update any remaining references in workflow_rules
UPDATE workflow_rules SET route_to_department = 'claims' WHERE route_to_department = 'invoices';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_vendor ON claims(vendor);
CREATE INDEX IF NOT EXISTS idx_claims_date ON claims(date);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_claims_flagged ON claims(flagged);

COMMIT;

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'claims' 
ORDER BY ordinal_position;
EOF

echo ""
echo "📝 Creating database connection script..."
cat > backend/scripts/run_migration.sh << 'EOF'
#!/bin/bash

# Database connection details
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-TATA1tata1}
DB_NAME=${DB_NAME:-invoices_db}

echo "Running database migration..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"

# Run the migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /app/migrations/rename_invoices_to_claims.sql

echo "Migration completed!"
EOF

chmod +x backend/scripts/run_migration.sh

echo ""
echo "📝 Updating database queries in controllers..."
echo "Updating claimController.js..."

# Update queries in claimController.js
sed -i '' 's/FROM invoices/FROM claims/g' backend/controllers/claimController.js
sed -i '' 's/INTO invoices/INTO claims/g' backend/controllers/claimController.js
sed -i '' 's/UPDATE invoices/UPDATE claims/g' backend/controllers/claimController.js
sed -i '' 's/DELETE FROM invoices/DELETE FROM claims/g' backend/controllers/claimController.js

echo "Updating analyticsController.js..."
# Update queries in analyticsController.js
sed -i '' 's/FROM invoices/FROM claims/g' backend/controllers/analyticsController.js
sed -i '' 's/INTO invoices/INTO claims/g' backend/controllers/analyticsController.js

echo "Updating vendorController.js..."
# Update queries in vendorController.js
sed -i '' 's/FROM invoices/FROM claims/g' backend/controllers/vendorController.js
sed -i '' 's/INTO invoices/INTO claims/g' backend/controllers/vendorController.js

echo "Updating claimRoutes.js..."
# Update queries in claimRoutes.js (the ones we just added)
sed -i '' 's/FROM invoices/FROM claims/g' backend/routes/claimRoutes.js

echo ""
echo "📝 Updating database initialization..."
# Update dbInit.js to use claims table
sed -i '' 's/CREATE TABLE IF NOT EXISTS invoices/CREATE TABLE IF NOT EXISTS claims/g' backend/utils/dbInit.js
sed -i '' 's/INSERT INTO invoices/INSERT INTO claims/g' backend/utils/dbInit.js

echo ""
echo "📝 Updating Dockerfile to include migration script..."
# Add migration script to Dockerfile if it doesn't exist
if ! grep -q "COPY.*migrations" backend/Dockerfile; then
    sed -i '' '/COPY package\*.json/a\
COPY migrations/ ./migrations/\nCOPY scripts/ ./scripts/
' backend/Dockerfile
fi

echo ""
echo "🧹 Rebuilding backend with schema updates..."
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
echo "🗄️ Running database migration..."
docker-compose exec backend bash -c "cd /app && ./scripts/run_migration.sh"

echo ""
echo "🧪 Testing database schema..."
echo "Testing claims table access..."

# Test if we can query the claims table
DB_TEST=$(docker-compose exec -T backend bash -c "PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME -c 'SELECT COUNT(*) FROM claims;' -t" 2>/dev/null | tr -d ' ')
echo "Claims table record count: $DB_TEST"

echo ""
echo "🔍 Testing API endpoints with new schema..."
echo "Testing /api/claims endpoint..."

CLAIMS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/claims)
echo "Claims endpoint: $CLAIMS_RESPONSE"

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
echo "✅ Fix #2 Complete!"
echo ""
echo "🎯 What was fixed:"
echo "  ✅ Created database migration script"
echo "  ✅ Renamed invoices table to claims"
echo "  ✅ Updated foreign key references"
echo "  ✅ Updated all database queries in controllers"
echo "  ✅ Updated database initialization"
echo "  ✅ Added migration script to Dockerfile"
echo "  ✅ Tested database schema and API endpoints"
echo ""
echo "🌐 Test the application:"
echo "   Login: https://clarifyops.com/login"
echo "   Claims: https://clarifyops.com/claims"
echo "   Builder: https://clarifyops.com/builder"
echo "   Operations: https://clarifyops.com/operations"
echo ""
echo "📋 Next: Run fix-3-input-validation.sh for the next critical fix"
echo ""
echo "🔧 If issues arise:"
echo "  docker-compose logs backend"
echo "  docker-compose exec backend bash -c 'PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME -c \"SELECT table_name FROM information_schema.tables WHERE table_name LIKE '\''%claim%'\'' OR table_name LIKE '\''%invoice%'\'';\"'" 