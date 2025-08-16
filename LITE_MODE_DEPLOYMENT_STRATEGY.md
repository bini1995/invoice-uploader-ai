# ClarifyOps Lite Mode Deployment Strategy

## Overview
This document outlines the strategy for deploying ClarifyOps in "Lite" mode to pilot customers while maintaining the full-featured version for investors and enterprise customers.

## 🎯 **Strategy: Feature Flags + Environment Variables**

### **Approach:**
- **Keep existing codebase intact** - No code deletion or commenting
- **Use feature flags** - Control features via environment variables
- **Create simplified UI components** - Lite-specific components for pilot customers
- **Same backend** - All APIs remain functional, frontend controls feature access

## 🚀 **Implementation Plan**

### **Phase 1: Feature Flag Infrastructure (Week 1)**

#### **1.1 Environment Variables Setup**
```bash
# .env files for different modes
REACT_APP_LITE_MODE=true          # Enable Lite mode
REACT_APP_DEMO_MODE=false         # Demo mode for testing
REACT_APP_FEATURE_TOUR=false      # Disable complex onboarding
REACT_APP_SHOW_UPGRADE_PROMPTS=true # Show upgrade prompts in Lite
```

#### **1.2 Feature Flag System**
- ✅ **Created**: `frontend/src/config/featureFlags.js`
- ✅ **Created**: `frontend/src/components/LiteNavigation.jsx`
- ✅ **Created**: `frontend/src/components/LiteClaimsPage.jsx`

#### **1.3 Backend Feature Controls**
```javascript
// backend/middleware/featureMiddleware.js
const checkFeatureAccess = (featureName) => {
  const tenantId = req.headers['x-tenant-id'];
  const isLiteMode = process.env.LITE_MODE === 'true';
  
  if (isLiteMode && ADVANCED_FEATURES.includes(featureName)) {
    return res.status(403).json({ 
      error: 'Feature not available in Lite mode',
      upgrade: true 
    });
  }
};
```

### **Phase 2: Lite Mode Components (Week 2)**

#### **2.1 Simplified Navigation**
- ✅ **LiteNavigation.jsx** - Only essential menu items
- **Features**: Claims, Search, Reports, Team, Settings
- **Hidden**: Advanced dashboards, fraud detection, workflows

#### **2.2 Simplified Claims Page**
- ✅ **LiteClaimsPage.jsx** - Core upload and list functionality
- **Features**: Upload, basic list, simple status
- **Hidden**: Advanced filtering, AI explainability, complex workflows

#### **2.3 Simplified Dashboard**
```javascript
// frontend/src/components/LiteDashboard.jsx
const LiteDashboard = () => {
  return (
    <div>
      <StatCard title="Total Claims" value={totalClaims} />
      <StatCard title="Processed Today" value={processedToday} />
      <StatCard title="Pending Review" value={pendingReview} />
      <StatCard title="Success Rate" value={`${successRate}%`} />
    </div>
  );
};
```

### **Phase 3: Routing and Navigation (Week 3)**

#### **3.1 Conditional Routing**
```javascript
// frontend/src/index.js
const App = () => {
  const isLiteMode = process.env.REACT_APP_LITE_MODE === 'true';
  
  return (
    <Router>
      {isLiteMode ? <LiteNavigation /> : <FullNavigation />}
      <Routes>
        <Route path="/claims" element={
          isLiteMode ? <LiteClaimsPage /> : <ClaimsPage />
        } />
        {/* Other routes */}
      </Routes>
    </Router>
  );
};
```

#### **3.2 API Endpoint Protection**
```javascript
// backend/routes/claimRoutes.js
router.get('/fraud-detection', (req, res) => {
  if (process.env.LITE_MODE === 'true') {
    return res.status(403).json({
      error: 'Fraud detection not available in Lite mode',
      upgrade: true
    });
  }
  // ... fraud detection logic
});
```

## 📦 **Deployment Configurations**

### **Lite Mode Deployment**
```bash
# Production Lite Mode
REACT_APP_LITE_MODE=true
REACT_APP_DEMO_MODE=false
REACT_APP_SHOW_UPGRADE_PROMPTS=true
LITE_MODE=true
```

### **Full Mode Deployment**
```bash
# Production Full Mode
REACT_APP_LITE_MODE=false
REACT_APP_DEMO_MODE=false
REACT_APP_SHOW_UPGRADE_PROMPTS=false
LITE_MODE=false
```

### **Demo Mode Deployment**
```bash
# Demo Mode
REACT_APP_LITE_MODE=false
REACT_APP_DEMO_MODE=true
REACT_APP_SHOW_UPGRADE_PROMPTS=false
LITE_MODE=false
```

## 🎯 **Feature Comparison**

### **Lite Mode Features**
```
✅ Core Upload & Processing
✅ Basic AI Extraction
✅ Simple Validation
✅ Basic Search & Filter
✅ Simple Reports
✅ User Management
✅ Basic Analytics
❌ Advanced Fraud Detection
❌ AI Explainability
❌ Complex Workflows
❌ Vendor Profiles
❌ Advanced Integrations
❌ Multi-tenant Support
```

### **Full Mode Features**
```
✅ All Lite Features
✅ Advanced Fraud Detection
✅ AI Explainability
✅ Complex Workflows
✅ Vendor Profiles
✅ Advanced Integrations
✅ Multi-tenant Support
✅ Advanced Analytics
✅ Custom Dashboards
✅ API Access
```

## 🚀 **Deployment Options**

### **Option 1: Separate Deployments (Recommended)**
```bash
# Lite Mode for Pilot Customers
docker run -e REACT_APP_LITE_MODE=true -e LITE_MODE=true clarifyops:lite

# Full Mode for Investors/Enterprise
docker run -e REACT_APP_LITE_MODE=false -e LITE_MODE=false clarifyops:full
```

### **Option 2: Single Deployment with Tenant-based Features**
```javascript
// Use tenant context to determine features
const getTenantFeatures = (tenantId) => {
  const liteTenants = ['pilot1', 'pilot2', 'pilot3'];
  return liteTenants.includes(tenantId) ? LITE_FEATURES : FULL_FEATURES;
};
```

### **Option 3: Subdomain-based Deployment**
```
lite.clarifyops.com     # Lite mode for pilots
app.clarifyops.com      # Full mode for enterprise
demo.clarifyops.com     # Demo mode for testing
```

## 📊 **Pilot Customer Strategy**

### **Target Customers**
1. **Small Insurance Companies** (1-50 employees)
2. **TPAs** (Third Party Administrators)
3. **Self-insured Employers**
4. **Medical Practices**

### **Pilot Timeline**
- **Week 1-2**: Deploy Lite mode
- **Week 3-4**: Onboard 3-5 pilot customers
- **Week 5-8**: Collect feedback and iterate
- **Week 9-12**: Expand to 10-15 customers
- **Month 4**: Present results to investors

### **Success Metrics**
- **Adoption Rate**: 70%+ of pilot customers actively using
- **Processing Volume**: 100+ claims per customer per month
- **Accuracy**: 90%+ AI extraction accuracy
- **Time Savings**: 50%+ reduction in processing time
- **Customer Satisfaction**: 4.5+ star rating

## 🔧 **Technical Implementation**

### **Frontend Changes**
```javascript
// Conditional component rendering
const ClaimsPage = () => {
  const isLiteMode = isFeatureEnabled('LITE_MODE');
  
  if (isLiteMode) {
    return <LiteClaimsPage />;
  }
  
  return <FullClaimsPage />;
};
```

### **Backend Changes**
```javascript
// Feature-gated API endpoints
app.use('/api/claims', (req, res, next) => {
  if (process.env.LITE_MODE === 'true' && req.path.includes('/fraud')) {
    return res.status(403).json({ error: 'Feature not available in Lite mode' });
  }
  next();
});
```

### **Database Changes**
```sql
-- Add tenant features table
CREATE TABLE tenant_features (
  tenant_id VARCHAR(255) PRIMARY KEY,
  mode VARCHAR(50) DEFAULT 'lite',
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert pilot tenants
INSERT INTO tenant_features (tenant_id, mode) VALUES 
('pilot1', 'lite'),
('pilot2', 'lite'),
('pilot3', 'lite');
```

## 🎯 **Benefits of This Approach**

### **For Pilot Customers**
- **Simplified Experience**: Easy to understand and use
- **Faster Onboarding**: Reduced complexity
- **Clear Value**: Focus on core benefits
- **Lower Risk**: Start with essential features

### **For Investors**
- **Proven Technology**: Same backend, proven reliability
- **Scalable Architecture**: Easy to add features
- **Market Validation**: Real customer feedback
- **Clear Roadmap**: Path from Lite to Full

### **For Development**
- **No Code Duplication**: Single codebase
- **Easy Testing**: Feature flags for testing
- **Flexible Deployment**: Multiple configurations
- **Quick Iteration**: Easy to add/remove features

## 🚀 **Next Steps**

1. **Implement feature flags** (Week 1)
2. **Create Lite components** (Week 2)
3. **Set up deployment pipeline** (Week 3)
4. **Deploy Lite mode** (Week 4)
5. **Onboard pilot customers** (Week 5-6)
6. **Collect feedback and iterate** (Week 7-12)
7. **Present to investors** (Month 4)

This approach allows you to quickly deploy a simplified version for pilot customers while maintaining the full-featured version for investors, all from the same codebase. 