
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { exportFilteredInvoices, exportAllInvoices } = require('../controllers/invoiceController');

const { login, refreshToken, logout, authMiddleware, authorizeRoles } = require('../controllers/userController');

const {
  uploadInvoice,
  getAllInvoices,
  clearAllInvoices,
  deleteInvoiceById,
  searchInvoicesByVendor,
  exportFilteredInvoicesCSV,
  archiveInvoice,
  unarchiveInvoice,
  updateInvoiceField,
  exportArchivedInvoicesCSV,
  getMonthlyInsights,
  getCashFlow,
  getTopVendors,
  getSpendingByTag,
  getUploadHeatmap,
  getQuickStats,
  getDashboardData,
  exportDashboardPDF,
  checkRecurringInvoice,
  getRecurringInsights,
  getVendorProfile,
  assignInvoice,
  approveInvoice,
  rejectInvoice,
  addComment,
  handleSuggestion,
  suggestTags,
  updateInvoiceTags,
  generateInvoicePDF,
  markInvoicePaid,
  bulkArchiveInvoices,
  bulkAssignInvoices,
  bulkApproveInvoices,
  bulkRejectInvoices,
  exportPDFBundle,
  updatePrivateNotes,
  updateRetentionPolicy,
  explainFlaggedInvoice,
  explainInvoice,
  bulkAutoCategorize,
  autoCategorizeInvoice,
  getVendorBio,
  getVendorScorecards,
  getRelationshipGraph,
  setReviewFlag,
} = require('../controllers/invoiceController');


const { summarizeUploadErrors } = require('../controllers/aiController');
const { invoiceQualityScore, assistantQuery, paymentRiskScore, nlChartQuery, suggestTagColors } = require('../controllers/aiController');
const router = express.Router();
const { sendSummaryEmail } = require('../controllers/emailController');
const { summarizeVendorData } = require('../controllers/aiController');
const { suggestVendor } = require('../controllers/aiController');
const { naturalLanguageQuery } = require("../controllers/aiController");
const { flagSuspiciousInvoice } = require('../controllers/invoiceController');
const { getActivityLogs, getInvoiceTimeline, exportComplianceReport } = require('../controllers/activityController');
const { setBudget, getBudgets, checkBudgetWarnings, getBudgetVsActual } = require('../controllers/budgetController');
const { getAnomalies } = require('../controllers/anomalyController');
const { detectPatterns, fraudHeatmap } = require('../controllers/fraudController');
const { vendorReply } = require('../controllers/vendorReplyController');
const { paymentRequest, paymentRequestPDF } = require('../controllers/paymentRequestController');
const { scenarioCashFlow } = require('../controllers/scenarioController');


router.get('/export-archived', authMiddleware, exportArchivedInvoicesCSV);
router.post('/:id/mark-paid', authMiddleware, authorizeRoles('finance','admin'), markInvoicePaid);
router.post('/suggest-vendor', suggestVendor);
router.post('/send-email', sendSummaryEmail);
router.post('/upload', authMiddleware, authorizeRoles('admin'), upload.single('invoiceFile'), uploadInvoice);
router.get('/', getAllInvoices);
router.delete('/clear', authMiddleware, authorizeRoles('admin'), clearAllInvoices);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteInvoiceById);
router.get('/search', searchInvoicesByVendor);
router.post('/nl-query', authMiddleware, naturalLanguageQuery);
router.post('/nl-chart', authMiddleware, nlChartQuery);
router.post('/quality-score', authMiddleware, invoiceQualityScore);
router.post('/payment-risk', authMiddleware, paymentRiskScore);
router.post('/assistant', authMiddleware, assistantQuery);
router.post('/summarize-errors', summarizeUploadErrors);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/export-filtered', authMiddleware, exportFilteredInvoicesCSV);
router.get('/export-all', authMiddleware, exportAllInvoices);
router.post('/summarize-vendor-data', summarizeVendorData);
router.get('/monthly-insights', authMiddleware, getMonthlyInsights);
router.get('/cash-flow', authMiddleware, getCashFlow);
router.post('/cash-flow/scenario', authMiddleware, scenarioCashFlow);
router.get('/top-vendors', authMiddleware, getTopVendors);
router.get('/spending-by-tag', authMiddleware, getSpendingByTag);
router.get('/upload-heatmap', authMiddleware, getUploadHeatmap);
router.get('/quick-stats', authMiddleware, getQuickStats);
router.get('/dashboard', authMiddleware, getDashboardData);
router.get('/recurring/insights', authMiddleware, getRecurringInsights);
router.get('/vendor-profile/:vendor', authMiddleware, getVendorProfile);
router.get('/vendor-bio/:vendor', authMiddleware, getVendorBio);
router.get('/dashboard/pdf', authMiddleware, exportDashboardPDF);
router.post('/flag-suspicious', authMiddleware, flagSuspiciousInvoice);
router.get('/:id/flag-explanation', authMiddleware, explainFlaggedInvoice);
router.get('/:id/explain', authMiddleware, explainInvoice);
router.patch('/:id/archive', authMiddleware, archiveInvoice);
router.post('/:id/unarchive', authMiddleware, unarchiveInvoice);
router.post('/suggest-vendor', authMiddleware, handleSuggestion);
router.patch('/:id/update', authMiddleware, updateInvoiceField);
router.patch('/:id/assign', authMiddleware, assignInvoice);
router.patch('/:id/approve', authMiddleware, authorizeRoles('reviewer','admin'), approveInvoice);
router.patch('/:id/reject', authMiddleware, authorizeRoles('reviewer','admin'), rejectInvoice);
router.post('/:id/comments', authMiddleware, authorizeRoles('reviewer','admin'), addComment);
router.post('/:id/vendor-reply', authMiddleware, authorizeRoles('reviewer','admin'), vendorReply);
router.patch('/bulk/archive', authMiddleware, authorizeRoles('admin'), bulkArchiveInvoices);
router.patch('/bulk/assign', authMiddleware, authorizeRoles('admin'), bulkAssignInvoices);
router.patch('/bulk/approve', authMiddleware, authorizeRoles('reviewer','admin'), bulkApproveInvoices);
router.patch('/bulk/reject', authMiddleware, authorizeRoles('reviewer','admin'), bulkRejectInvoices);
router.post('/bulk/pdf', authMiddleware, exportPDFBundle);
router.post('/bulk/auto-categorize', authMiddleware, bulkAutoCategorize);
router.post('/:id/auto-categorize', authMiddleware, autoCategorizeInvoice);
router.patch('/:id/notes', authMiddleware, authorizeRoles('admin'), updatePrivateNotes);
router.patch('/:id/retention', authMiddleware, authorizeRoles('admin'), updateRetentionPolicy);
router.post('/suggest-tags', authMiddleware, suggestTags);
router.post('/suggest-tag-colors', authMiddleware, suggestTagColors);
router.post('/:id/update-tags', authMiddleware, updateInvoiceTags);
router.patch('/:id/review-flag', authMiddleware, authorizeRoles('admin','reviewer'), setReviewFlag);
router.get('/logs', authMiddleware, authorizeRoles('admin'), getActivityLogs);
router.get('/logs/export', authMiddleware, authorizeRoles('admin'), exportComplianceReport);
router.get('/:id/timeline', authMiddleware, getInvoiceTimeline);
router.post('/budgets', authMiddleware, authorizeRoles('admin'), setBudget);
router.get('/budgets', authMiddleware, authorizeRoles('admin'), getBudgets);
router.get('/budgets/warnings', authMiddleware, checkBudgetWarnings);
router.get('/budgets/department-report', authMiddleware, getBudgetVsActual);
router.get('/anomalies', authMiddleware, getAnomalies);
router.get('/fraud/patterns', authMiddleware, authorizeRoles('admin'), detectPatterns);
router.get('/fraud/heatmap', authMiddleware, authorizeRoles('admin'), fraudHeatmap);
router.get('/:id/check-recurring', authMiddleware, checkRecurringInvoice);
router.get('/vendor-scorecards', authMiddleware, getVendorScorecards);
router.get('/graph', authMiddleware, getRelationshipGraph);


// ✅ GET PDF download
router.get('/:id/pdf', authMiddleware, generateInvoicePDF);
router.get('/:id/payment-request', authMiddleware, paymentRequest);
router.get('/:id/payment-request/pdf', authMiddleware, paymentRequestPDF);






module.exports = router;
