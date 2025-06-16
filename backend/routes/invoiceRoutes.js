
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { exportFilteredInvoices, exportAllInvoices, importInvoicesCSV } = require('../controllers/invoiceController');

const { login, refreshToken, logout, authMiddleware, authorizeRoles } = require('../controllers/userController');

const {
  uploadInvoice,
  voiceUpload,
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
  bulkDeleteInvoices,
  bulkUpdateInvoices,
  exportPDFBundle,
  updatePrivateNotes,
  updateRetentionPolicy,
  explainFlaggedInvoice,
  explainInvoice,
  bulkAutoCategorize,
  autoCategorizeInvoice,
  autoTagCategories,
  getVendorBio,
  getVendorScorecards,
  getRelationshipGraph,
  setReviewFlag,
  setFlaggedStatus,
  setPaymentStatus,
  shareInvoices,
  getSharedInvoices,
  getInvoiceVersions,
  restoreInvoiceVersion,
} = require('../controllers/invoiceController');


const { summarizeUploadErrors } = require('../controllers/aiController');
const { invoiceQualityScore, assistantQuery, billingQuery, onboardingHelp, paymentRiskScore, paymentLikelihood, nlChartQuery, suggestTagColors } = require('../controllers/aiController');
const router = express.Router();
const { sendSummaryEmail } = require('../controllers/emailController');
const { summarizeVendorData } = require('../controllers/aiController');
const { suggestVendor, suggestVoucher } = require('../controllers/aiController');
const { naturalLanguageQuery, naturalLanguageSearch } = require("../controllers/aiController");
const { flagSuspiciousInvoice } = require('../controllers/invoiceController');
const { getActivityLogs, getInvoiceTimeline, exportComplianceReport, exportInvoiceHistory, exportVendorHistory } = require('../controllers/activityController');
const { setBudget, getBudgets, checkBudgetWarnings, getBudgetVsActual } = require('../controllers/budgetController');
const { getAnomalies } = require('../controllers/anomalyController');
const { detectPatterns, fraudHeatmap } = require('../controllers/fraudController');
const { vendorReply } = require('../controllers/vendorReplyController');
const { paymentRequest, paymentRequestPDF } = require('../controllers/paymentRequestController');
const { scenarioCashFlow } = require('../controllers/scenarioController');


router.get('/export-archived', authMiddleware, exportArchivedInvoicesCSV);
router.patch('/:id/payment-status', authMiddleware, authorizeRoles('finance','admin'), setPaymentStatus);
router.post('/:id/mark-paid', authMiddleware, authorizeRoles('finance','admin'), markInvoicePaid);
router.post('/suggest-vendor', suggestVendor);
router.post('/suggest-voucher', suggestVoucher);
router.post('/send-email', sendSummaryEmail);
router.post('/upload', authMiddleware, authorizeRoles('admin'), upload.single('invoiceFile'), uploadInvoice);
router.post('/import-csv', authMiddleware, authorizeRoles('admin'), upload.single('file'), importInvoicesCSV);
router.post('/voice-upload', authMiddleware, authorizeRoles('admin'), voiceUpload);
router.get('/', getAllInvoices);
router.delete('/clear', authMiddleware, authorizeRoles('admin'), clearAllInvoices);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteInvoiceById);
router.get('/search', searchInvoicesByVendor);
router.post('/nl-query', authMiddleware, naturalLanguageQuery);
router.post('/nl-search', authMiddleware, naturalLanguageSearch);
router.post('/nl-chart', authMiddleware, nlChartQuery);
router.post('/quality-score', authMiddleware, invoiceQualityScore);
router.post('/payment-risk', authMiddleware, paymentRiskScore);
router.post('/payment-likelihood', authMiddleware, paymentLikelihood);
router.post('/assistant', authMiddleware, assistantQuery);
router.post('/billing-query', authMiddleware, billingQuery);
router.get('/help/onboarding', authMiddleware, onboardingHelp);
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
router.delete('/bulk/delete', authMiddleware, authorizeRoles('admin'), bulkDeleteInvoices);
router.patch('/bulk/edit', authMiddleware, authorizeRoles('admin'), bulkUpdateInvoices);
router.post('/bulk/pdf', authMiddleware, exportPDFBundle);
router.post('/bulk/auto-categorize', authMiddleware, bulkAutoCategorize);
router.post('/:id/auto-categorize', authMiddleware, autoCategorizeInvoice);
router.post('/:id/auto-tag', authMiddleware, autoTagCategories);
router.patch('/:id/notes', authMiddleware, authorizeRoles('admin'), updatePrivateNotes);
router.patch('/:id/retention', authMiddleware, authorizeRoles('admin'), updateRetentionPolicy);
router.post('/suggest-tags', authMiddleware, suggestTags);
router.post('/suggest-tag-colors', authMiddleware, suggestTagColors);
router.post('/:id/update-tags', authMiddleware, updateInvoiceTags);
router.patch('/:id/review-flag', authMiddleware, authorizeRoles('admin','reviewer'), setReviewFlag);
router.patch('/:id/flag', authMiddleware, authorizeRoles('reviewer','admin'), setFlaggedStatus);
router.get('/logs', authMiddleware, authorizeRoles('admin'), getActivityLogs);
router.get('/logs/export', authMiddleware, authorizeRoles('admin'), exportComplianceReport);
router.get('/logs/invoice/:id/export', authMiddleware, authorizeRoles('admin'), exportInvoiceHistory);
router.get('/logs/vendor/:vendor/export', authMiddleware, authorizeRoles('admin'), exportVendorHistory);
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
router.post('/share', authMiddleware, authorizeRoles('admin','reviewer'), shareInvoices);
router.get('/shared/:token', getSharedInvoices);
router.get('/:id/versions', authMiddleware, getInvoiceVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, authorizeRoles('admin'), restoreInvoiceVersion);
router.post('/:id/blockchain-hash', authMiddleware, authorizeRoles('admin'), require('../controllers/blockchainController').recordHash);
router.get('/:id/blockchain-status', authMiddleware, require('../controllers/blockchainController').verifyHash);






module.exports = router;
