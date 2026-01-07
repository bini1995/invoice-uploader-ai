// Feature Flags Configuration
// This file controls which features are enabled in Lite vs Full mode

const isLiteMode = import.meta.env.VITE_LITE_MODE === 'true';
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const FEATURE_FLAGS = {
  // Core Features (Always enabled)
  CORE_UPLOAD: true,
  CORE_EXTRACTION: true,
  CORE_VALIDATION: true,
  CORE_EXPORT: true,
  CORE_SEARCH: true,
  CORE_FILTERS: true,

  // Lite Mode Features (Simplified versions)
  LITE_DASHBOARD: true,
  LITE_REPORTING: true,
  LITE_BASIC_ANALYTICS: true,
  LITE_USER_MANAGEMENT: true,

  // Advanced Features (Disabled in Lite mode)
  ADVANCED_FRAUD_DETECTION: !isLiteMode,
  ADVANCED_AI_EXPLAINABILITY: !isLiteMode,
  ADVANCED_WORKFLOWS: !isLiteMode,
  ADVANCED_AUTOMATION: !isLiteMode,
  ADVANCED_VENDOR_PROFILES: !isLiteMode,
  ADVANCED_ANOMALY_DETECTION: !isLiteMode,
  ADVANCED_COLLABORATION: !isLiteMode,
  ADVANCED_INTEGRATIONS: !isLiteMode,

  // Enterprise Features (Only in Full mode)
  ENTERPRISE_MULTI_TENANT: !isLiteMode && !isDemoMode,
  ENTERPRISE_ADVANCED_SECURITY: !isLiteMode && !isDemoMode,
  ENTERPRISE_CUSTOM_WORKFLOWS: !isLiteMode && !isDemoMode,
  ENTERPRISE_API_ACCESS: !isLiteMode && !isDemoMode,

  // UI Features
  SHOW_ADVANCED_NAVIGATION: !isLiteMode,
  SHOW_COMPLEX_DASHBOARDS: !isLiteMode,
  SHOW_ADVANCED_CHARTS: !isLiteMode,
  SHOW_FEATURE_TOUR: !isLiteMode,
  SHOW_UPGRADE_PROMPTS: isLiteMode,

  // Demo Features
  DEMO_MODE: isDemoMode,
  DEMO_DATA_LOADING: isDemoMode,
  DEMO_TENANT_SWITCHING: isDemoMode,
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (featureName) => {
  return FEATURE_FLAGS[featureName] === true;
};

// Helper function to get feature-specific configuration
export const getFeatureConfig = (featureName) => {
  const configs = {
    LITE_DASHBOARD: {
      maxCards: 4,
      simplifiedMetrics: true,
      hideAdvancedCharts: true,
    },
    LITE_REPORTING: {
      maxExports: 10,
      basicTemplates: true,
      hideAdvancedFilters: true,
    },
    ADVANCED_FRAUD_DETECTION: {
      enabled: !isLiteMode,
      confidenceThreshold: 0.8,
      maxFlagsPerClaim: 5,
    },
  };
  
  return configs[featureName] || {};
};

// Get current mode information
export const getCurrentMode = () => {
  if (isDemoMode) return 'demo';
  if (isLiteMode) return 'lite';
  return 'full';
};

// Check if user should see upgrade prompts
export const shouldShowUpgradePrompt = () => {
  return isLiteMode && !isDemoMode;
};

// Get available features for current mode
export const getAvailableFeatures = () => {
  const mode = getCurrentMode();
  const features = {
    lite: [
      'Upload Claims',
      'AI Extraction',
      'Basic Validation',
      'Simple Reports',
      'Basic Search',
      'User Management',
    ],
    full: [
      'Upload Claims',
      'AI Extraction',
      'Advanced Validation',
      'Fraud Detection',
      'AI Explainability',
      'Advanced Workflows',
      'Vendor Profiles',
      'Anomaly Detection',
      'Collaboration Tools',
      'API Access',
      'Multi-tenant Support',
    ],
    demo: [
      'Upload Claims',
      'AI Extraction',
      'Basic Validation',
      'Demo Data',
      'Feature Tour',
    ],
  };
  
  return features[mode] || features.lite;
}; 
