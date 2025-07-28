const express = require('express');
const router = express.Router();
const {
  getUsageStats,
  getUsageLogs,
  getUsageTrends,
  checkUsageLimit,
  trackUsageAction,
  getUsageLimits,
  resetUsage,
  getUsageAnalytics
} = require('../controllers/usageController');
const { authMiddleware } = require('../controllers/userController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get usage statistics
router.get('/stats', getUsageStats);

// Get detailed usage logs
router.get('/logs', getUsageLogs);

// Get usage trends
router.get('/trends', getUsageTrends);

// Check usage limit for a specific action
router.get('/limit/:action', checkUsageLimit);

// Track usage for a specific action
router.post('/track/:action', trackUsageAction);

// Get usage limits for current plan
router.get('/limits', getUsageLimits);

// Get comprehensive usage analytics
router.get('/analytics', getUsageAnalytics);

// Admin endpoint to reset usage (for testing/development)
router.post('/reset', resetUsage);

module.exports = router; 