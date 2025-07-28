# Usage Tracking System Setup Guide

## Overview

This guide will help you implement comprehensive usage tracking for your Invoice Uploader AI application. The system tracks:

- **Claims Uploads**: Number of documents uploaded
- **AI Extractions**: Number of field extractions performed
- **CSV Exports**: Number of data exports generated

## Features

✅ **Automatic Tracking**: Middleware automatically tracks usage for specific endpoints  
✅ **Usage Limits**: Enforce monthly limits based on user plans  
✅ **Real-time Analytics**: Monitor usage patterns and trends  
✅ **Plan-based Limits**: Different limits for free, starter, professional, and enterprise plans  
✅ **Prometheus Metrics**: Integration with existing monitoring system  
✅ **Frontend Dashboard**: Beautiful UI component to display usage statistics  

## Installation Steps

### 1. Database Setup

Run the migration to create the required tables:

```bash
# Connect to your PostgreSQL database
psql -d your_database_name -f backend/migrations/create_usage_tracking_tables.sql
```

This creates:
- `usage_logs` table for detailed tracking
- `monthly_usage` table for fast aggregations
- `plan_type` column in the `users` table
- Indexes for optimal performance

### 2. Backend Integration

#### Add Routes to app.js

Add the usage routes to your main application:

```javascript
// In backend/app.js
const usageRoutes = require('./routes/usageRoutes');

// Add this line with your other route registrations
app.use('/api/usage', usageRoutes);
```

#### Add Middleware to Protected Routes

Add usage tracking middleware to routes that should be tracked:

```javascript
// In your route files (e.g., claimRoutes.js, analyticsRoutes.js)
const { usageTrackingMiddleware } = require('../middleware/usageTrackingMiddleware');

// Apply to specific routes
router.post('/upload', usageTrackingMiddleware(), uploadDocument);
router.post('/extract-fields', usageTrackingMiddleware(), extractFields);
router.get('/export/csv', usageTrackingMiddleware(), exportCSV);
```

### 3. Frontend Integration

#### Add Usage Tracker Component

Import and use the UsageTracker component in your dashboard:

```javascript
// In your dashboard component
import UsageTracker from './components/UsageTracker';

// Add to your JSX
<UsageTracker className="mb-6" />
```

#### Update API Configuration

Ensure your API base URL is correctly configured in `frontend/src/api.js`.

## Configuration

### Usage Limits by Plan

The system comes with predefined limits that you can customize in `backend/utils/usageTracker.js`:

```javascript
const USAGE_LIMITS = {
  free: {
    claims_uploads: 50,
    extractions: 100,
    csv_exports: 10
  },
  starter: {
    claims_uploads: 500,
    extractions: 1000,
    csv_exports: 100
  },
  professional: {
    claims_uploads: 5000,
    extractions: 10000,
    csv_exports: 1000
  },
  enterprise: {
    claims_uploads: -1, // unlimited
    extractions: -1,
    csv_exports: -1
  }
};
```

### Tracked Endpoints

The system automatically tracks these endpoints:

- `POST /api/claims/upload` → `claims_uploads`
- `POST /api/invoices/upload` → `claims_uploads`
- `POST /api/documents/upload` → `claims_uploads`
- `POST /api/ai/extract` → `extractions`
- `POST /api/invoices/extract-fields` → `extractions`
- `POST /api/claims/extract-fields` → `extractions`
- `GET /api/analytics/export/csv` → `csv_exports`
- `GET /api/invoices/export/csv` → `csv_exports`
- `GET /api/claims/export/csv` → `csv_exports`

## API Endpoints

### Get Usage Statistics
```
GET /api/usage/stats?period=current_month
```

Response:
```json
{
  "success": true,
  "data": {
    "claims_uploads": {
      "total": 25,
      "limit": 50,
      "remaining": 25
    },
    "extractions": {
      "total": 45,
      "limit": 100,
      "remaining": 55
    },
    "csv_exports": {
      "total": 3,
      "limit": 10,
      "remaining": 7
    }
  }
}
```

### Get Usage Limits
```
GET /api/usage/limits
```

### Get Usage Trends
```
GET /api/usage/trends?period=last_6_months
```

### Check Specific Limit
```
GET /api/usage/limit/claims_uploads
```

### Track Usage (Manual)
```
POST /api/usage/track/claims_uploads
{
  "details": {
    "fileType": "pdf",
    "fileSize": 1024000
  }
}
```

## Monitoring & Analytics

### Prometheus Metrics

The system exposes these Prometheus metrics:

- `usage_limit_exceeded_total` - Count of limit violations
- `usage_tracking_total` - Count of tracking events
- `usage_remaining` - Gauge of remaining usage
- `usage_percentage` - Gauge of usage percentage

### Grafana Dashboard

Create a Grafana dashboard with these panels:

1. **Usage Overview**
   - Current month usage by action
   - Usage percentage by plan type
   - Limit violations over time

2. **Trends**
   - Monthly usage trends
   - Peak usage times
   - Plan upgrade opportunities

3. **Alerts**
   - Usage approaching limits
   - Unusual usage patterns
   - Plan upgrade recommendations

## Frontend Features

### Usage Tracker Component

The `UsageTracker` component provides:

- **Real-time Statistics**: Current month usage with visual progress bars
- **Plan Information**: Shows current plan and limits
- **Usage Trends**: Historical usage data
- **Visual Indicators**: Color-coded usage levels (green/yellow/red)
- **Responsive Design**: Works on all device sizes

### Integration Examples

#### Dashboard Integration
```javascript
// In your main dashboard
import UsageTracker from './components/UsageTracker';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UsageTracker />
      {/* Other dashboard components */}
    </div>
  );
}
```

#### Settings Page Integration
```javascript
// In your settings page
function SettingsPage() {
  return (
    <div className="space-y-6">
      <UsageTracker />
      <PlanUpgradeSection />
      <UsageHistory />
    </div>
  );
}
```

## Testing

### Manual Testing

1. **Upload a document** and check usage increases
2. **Export CSV** and verify export count
3. **Extract fields** and confirm extraction tracking
4. **Exceed limits** and verify 429 responses

### Automated Testing

Create test cases for:

```javascript
// Test usage tracking
describe('Usage Tracking', () => {
  it('should track document uploads', async () => {
    // Upload document
    // Check usage stats increased
  });

  it('should enforce usage limits', async () => {
    // Exceed limit
    // Verify 429 response
  });

  it('should reset monthly', async () => {
    // Mock date change
    // Verify reset
  });
});
```

## Troubleshooting

### Common Issues

1. **Usage not tracking**
   - Check middleware is applied to routes
   - Verify database tables exist
   - Check user authentication

2. **Limits not enforced**
   - Verify user has `plan_type` set
   - Check `USAGE_LIMITS` configuration
   - Ensure middleware is running

3. **Frontend not loading**
   - Check API endpoints are accessible
   - Verify authentication token
   - Check browser console for errors

### Debug Commands

```sql
-- Check usage data
SELECT * FROM usage_logs WHERE tenant_id = 'your_tenant' ORDER BY created_at DESC LIMIT 10;

-- Check monthly usage
SELECT * FROM monthly_usage WHERE tenant_id = 'your_tenant';

-- Check user plan
SELECT id, email, plan_type FROM users WHERE id = your_user_id;
```

## Performance Considerations

### Database Optimization

- Indexes are created automatically
- Monthly aggregations reduce query time
- JSONB for flexible details storage

### Caching

Consider adding Redis caching for:
- Usage statistics (cache for 5 minutes)
- User plan information (cache for 1 hour)
- Monthly aggregations (cache for 1 hour)

### Scaling

For high-volume applications:
- Use database partitioning by month
- Implement usage tracking queues
- Add rate limiting for API endpoints

## Security

### Data Protection

- Usage data is tenant-isolated
- User authentication required
- Admin-only reset functionality

### Rate Limiting

The system includes built-in rate limiting:
- 429 responses for limit violations
- Automatic tracking of violations
- Configurable limits per plan

## Next Steps

1. **Deploy the migration** to create database tables
2. **Add routes** to your main application
3. **Apply middleware** to protected endpoints
4. **Add the frontend component** to your dashboard
5. **Configure monitoring** in Grafana
6. **Test thoroughly** with different user plans
7. **Monitor usage patterns** and adjust limits as needed

This usage tracking system will provide valuable insights into how your application is being used and help you optimize your pricing and resource allocation. 