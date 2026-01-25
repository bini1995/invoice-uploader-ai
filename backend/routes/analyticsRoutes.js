import express from 'express';
import { listRules, addRule, updateRule, deleteRule } from '../controllers/rulesController.js';
import { authMiddleware } from '../controllers/userController.js';
import {
  getReport,
  exportReportPDF,
  exportReportExcel,
  exportReportCSV,
  getTrends,
  getAgingReport,
  getDashboardMetadata,
  getDashboardInsights,
  getApprovalStats,
  getApprovalTimeChart,
  getVendorSpend,
  getSpendHeatmap,
  detectOutliers,
  getRealTimeDashboard,
  getDashboardRecommendations,
  detectDuplicateInvoices,
  getApprovalTimeByVendor,
  getLatePaymentTrend,
  getRiskHeatmap,
  getInvoiceClusters,
  getCrossAlerts,
  getClaimAnalytics,
  detectClaimFraud,
  listReportSchedules,
  createReportSchedule,
  deleteReportSchedule,
} from '../controllers/analyticsController.js';

const router = express.Router();
router.get('/report', authMiddleware, getReport);
router.get('/report/pdf', authMiddleware, exportReportPDF);
router.get('/report/excel', authMiddleware, exportReportExcel);
router.get('/report/csv', authMiddleware, exportReportCSV);
router.get('/report/schedules', authMiddleware, listReportSchedules);
router.post('/report/schedules', authMiddleware, createReportSchedule);
router.delete('/report/schedules/:id', authMiddleware, deleteReportSchedule);
router.get('/trends', authMiddleware, getTrends);
router.get('/aging', authMiddleware, getAgingReport);
router.get('/rules', authMiddleware, listRules);
router.post('/rules', authMiddleware, addRule);
router.put('/rules/:idx', authMiddleware, updateRule);
router.delete('/rules/:idx', authMiddleware, deleteRule);
router.get('/approvals/stats', authMiddleware, getApprovalStats);
router.get('/approvals/times', authMiddleware, getApprovalTimeChart);
router.get('/spend/vendor', authMiddleware, getVendorSpend);
router.get('/spend/heatmap', authMiddleware, getSpendHeatmap);
router.get('/kpi/approval-time-vendor', authMiddleware, getApprovalTimeByVendor);
router.get('/kpi/late-payments-trend', authMiddleware, getLatePaymentTrend);
router.get('/metadata', authMiddleware, getDashboardMetadata);
router.get('/dashboard', authMiddleware, getDashboardInsights);
router.get('/outliers', authMiddleware, detectOutliers);
router.get('/dashboard/realtime', authMiddleware, getRealTimeDashboard);
router.get('/dashboard/recommendations', authMiddleware, getDashboardRecommendations);
router.get('/dashboard/cross-alerts', authMiddleware, getCrossAlerts);
router.get('/anomalies/duplicates', authMiddleware, detectDuplicateInvoices);
router.get('/risk/heatmap', authMiddleware, getRiskHeatmap);
router.get('/risk/clusters', authMiddleware, getInvoiceClusters);
router.get('/claims', authMiddleware, getClaimAnalytics);
router.get('/claims/fraud', authMiddleware, detectClaimFraud);

export default router;
