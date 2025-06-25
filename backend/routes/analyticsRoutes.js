const express = require('express');
const router = express.Router();
const {
  getReport,
  exportReportPDF,
  exportReportExcel,
  getTrends,
  getAgingReport,
  predictCashFlowRisk,
  forecastCashFlow,
  getDashboardMetadata,
  getApprovalStats,
  getApprovalTimeChart,
  getVendorSpend,
  detectOutliers,
  getRealTimeDashboard,
  detectDuplicateInvoices,
  getApprovalTimeByVendor,
  getLatePaymentTrend,
  getInvoicesOverBudget,
  getRiskHeatmap,
  getInvoiceClusters
} = require('../controllers/analyticsController');
const { listRules, addRule } = require('../controllers/rulesController');
const { authMiddleware } = require('../controllers/userController');

router.get('/report', authMiddleware, getReport);
router.get('/report/pdf', authMiddleware, exportReportPDF);
router.get('/report/excel', authMiddleware, exportReportExcel);
router.get('/trends', authMiddleware, getTrends);
router.get('/aging', authMiddleware, getAgingReport);
router.get('/cash-flow/predict', authMiddleware, predictCashFlowRisk);
router.get('/cash-flow/forecast', authMiddleware, forecastCashFlow);
router.get('/rules', authMiddleware, listRules);
router.post('/rules', authMiddleware, addRule);
router.get('/approvals/stats', authMiddleware, getApprovalStats);
router.get('/approvals/times', authMiddleware, getApprovalTimeChart);
router.get('/spend/vendor', authMiddleware, getVendorSpend);
router.get('/kpi/approval-time-vendor', authMiddleware, getApprovalTimeByVendor);
router.get('/kpi/late-payments-trend', authMiddleware, getLatePaymentTrend);
router.get('/kpi/over-budget', authMiddleware, getInvoicesOverBudget);
router.get('/metadata', authMiddleware, getDashboardMetadata);
router.get('/outliers', authMiddleware, detectOutliers);
router.get('/dashboard/realtime', authMiddleware, getRealTimeDashboard);
router.get('/anomalies/duplicates', authMiddleware, detectDuplicateInvoices);
router.get('/risk/heatmap', authMiddleware, getRiskHeatmap);
router.get('/risk/clusters', authMiddleware, getInvoiceClusters);

module.exports = router;
