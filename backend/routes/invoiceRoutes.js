
const express = require('express');
const multer = require('multer');
const settings = require('../config/settings');
const maxSize = Math.max(settings.csvSizeLimitMB, settings.pdfSizeLimitMB) * 1024 * 1024;
const upload = multer({ dest: 'uploads/', limits: { fileSize: maxSize } });
const { exportFilteredInvoices, exportAllInvoices, importInvoicesCSV } = require('../controllers/invoiceController');

const { login, refreshToken, logout, authMiddleware, authorizeRoles } = require('../controllers/userController');

const {
  uploadInvoice,
  voiceUpload,
  parseInvoiceSample,
  conversationalUpload,
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
  shareDashboard,
  getSharedDashboard,
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
  checkInvoiceSimilarity,
  suggestMappings,
  getProgressStats,
  seedDummyData,
  amountSuggestions,
} = require('../controllers/invoiceController');


const { summarizeUploadErrors } = require('../controllers/aiController');
const {
  invoiceQualityScore,
  assistantQuery,
  billingQuery,
  onboardingHelp,
  paymentRiskScore,
  paymentLikelihood,
  nlChartQuery,
  suggestTagColors,
  paymentBehaviorByVendor,
  thinkSuggestion,
  overdueEmailTemplate,
  invoiceCopilot,
  suggestFixes,
} = require('../controllers/aiController');
const router = express.Router({ mergeParams: true });
const { sendSummaryEmail } = require('../controllers/emailController');
const { smartDraftEmail } = require('../controllers/emailController');
const { summarizeVendorData } = require('../controllers/aiController');
const { suggestVendor, suggestVoucher } = require('../controllers/aiController');
const { naturalLanguageQuery, naturalLanguageSearch } = require("../controllers/aiController");
const { smartSearchParse } = require('../controllers/aiController');
const { flagSuspiciousInvoice } = require('../controllers/invoiceController');
const { getActivityLogs, getInvoiceTimeline, exportComplianceReport, exportInvoiceHistory, exportVendorHistory, exportActivityLogsCSV } = require('../controllers/activityController');
const { getAuditTrail, updateAuditEntry, deleteAuditEntry } = require('../controllers/auditController');
const { setBudget, getBudgets, checkBudgetWarnings, getBudgetVsActual, getBudgetForecast } = require('../controllers/budgetController');
const { getAnomalies } = require('../controllers/anomalyController');
const { detectPatterns, fraudHeatmap, mlDetect, labelFraud } = require('../controllers/fraudController');
const { vendorReply } = require('../controllers/vendorReplyController');
const { paymentRequest, paymentRequestPDF } = require('../controllers/paymentRequestController');
const { scenarioCashFlow } = require('../controllers/scenarioController');


router.get('/export-archived', authMiddleware, exportArchivedInvoicesCSV);
router.patch('/:id/payment-status', authMiddleware, authorizeRoles('accountant','admin'), setPaymentStatus);
router.post('/:id/mark-paid', authMiddleware, authorizeRoles('accountant','admin'), markInvoicePaid);
router.post('/suggest-vendor', suggestVendor);
router.post('/suggest-voucher', suggestVoucher);
router.post('/send-email', sendSummaryEmail);
router.post('/draft-smart-email', authMiddleware, smartDraftEmail);
router.post('/upload', authMiddleware, authorizeRoles('admin'), upload.single('invoiceFile'), uploadInvoice);
// allow unauthenticated access for free trial sample parsing
router.post('/parse-sample', upload.single('invoiceFile'), parseInvoiceSample);
router.post('/import-csv', authMiddleware, authorizeRoles('admin'), upload.single('file'), importInvoicesCSV);
router.post('/voice-upload', authMiddleware, authorizeRoles('admin'), voiceUpload);
router.post('/nl-upload', authMiddleware, authorizeRoles('admin'), conversationalUpload);
router.get('/', getAllInvoices);
router.delete('/clear', authMiddleware, authorizeRoles('admin'), clearAllInvoices);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteInvoiceById);
router.get('/search', searchInvoicesByVendor);
router.post('/nl-query', authMiddleware, naturalLanguageQuery);
router.post('/nl-search', authMiddleware, naturalLanguageSearch);
router.post('/smart-search', authMiddleware, smartSearchParse);
router.post('/nl-chart', authMiddleware, nlChartQuery);
router.post('/quality-score', authMiddleware, invoiceQualityScore);
router.post('/payment-risk', authMiddleware, paymentRiskScore);
router.post('/payment-likelihood', authMiddleware, paymentLikelihood);
router.post('/payment-behavior', authMiddleware, paymentBehaviorByVendor);
router.post('/assistant', authMiddleware, assistantQuery);
router.post('/billing-query', authMiddleware, billingQuery);
router.post('/:id/think-suggestion', authMiddleware, thinkSuggestion);
router.post('/:id/overdue-email', authMiddleware, overdueEmailTemplate);
router.post('/:id/copilot', authMiddleware, invoiceCopilot);
router.get('/help/onboarding', authMiddleware, onboardingHelp);
router.post('/summarize-errors', summarizeUploadErrors);
router.post('/suggest-fixes', authMiddleware, suggestFixes);
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
router.get('/amount-suggestions', authMiddleware, amountSuggestions);
router.get('/progress', authMiddleware, getProgressStats);
router.get('/dashboard', authMiddleware, getDashboardData);
router.get('/recurring/insights', authMiddleware, getRecurringInsights);
router.get('/vendor-profile/:vendor', authMiddleware, getVendorProfile);
router.get('/vendor-bio/:vendor', authMiddleware, getVendorBio);
router.get('/dashboard/pdf', authMiddleware, exportDashboardPDF);
router.post('/dashboard/share', authMiddleware, authorizeRoles('admin','approver'), shareDashboard);
router.get('/dashboard/shared/:token', getSharedDashboard);
router.post('/flag-suspicious', authMiddleware, flagSuspiciousInvoice);
router.post('/check-similarity', authMiddleware, checkInvoiceSimilarity);
router.get('/:id/flag-explanation', authMiddleware, explainFlaggedInvoice);
router.get('/:id/explain', authMiddleware, explainInvoice);
router.patch('/:id/archive', authMiddleware, authorizeRoles('approver'), archiveInvoice);
router.post('/:id/unarchive', authMiddleware, authorizeRoles('approver'), unarchiveInvoice);
router.post('/suggest-vendor', authMiddleware, handleSuggestion);
router.patch('/:id/update', authMiddleware, updateInvoiceField);
router.patch('/:id/assign', authMiddleware, assignInvoice);
router.patch('/:id/approve', authMiddleware, authorizeRoles('accountant','admin'), approveInvoice);
router.patch('/:id/reject', authMiddleware, authorizeRoles('approver','admin'), rejectInvoice);
router.post('/:id/comments', authMiddleware, authorizeRoles('approver','admin'), addComment);
router.post('/:id/vendor-reply', authMiddleware, authorizeRoles('approver','admin'), vendorReply);
router.patch('/bulk/archive', authMiddleware, authorizeRoles('approver'), bulkArchiveInvoices);
router.patch('/bulk/assign', authMiddleware, authorizeRoles('admin'), bulkAssignInvoices);
router.patch('/bulk/approve', authMiddleware, authorizeRoles('accountant','admin'), bulkApproveInvoices);
router.patch('/bulk/reject', authMiddleware, authorizeRoles('approver','admin'), bulkRejectInvoices);
router.delete('/bulk/delete', authMiddleware, authorizeRoles('admin'), bulkDeleteInvoices);
router.patch('/bulk/edit', authMiddleware, authorizeRoles('admin'), bulkUpdateInvoices);
router.post('/bulk/pdf', authMiddleware, exportPDFBundle);
router.post('/bulk/auto-categorize', authMiddleware, bulkAutoCategorize);
router.post('/seed-dummy', authMiddleware, authorizeRoles('admin'), seedDummyData);
router.post('/:id/auto-categorize', authMiddleware, autoCategorizeInvoice);
router.post('/:id/auto-tag', authMiddleware, autoTagCategories);
router.patch('/:id/notes', authMiddleware, authorizeRoles('admin'), updatePrivateNotes);
router.patch('/:id/retention', authMiddleware, authorizeRoles('admin'), updateRetentionPolicy);
router.post('/suggest-tags', authMiddleware, suggestTags);
router.post('/suggest-mappings', authMiddleware, suggestMappings);
router.post('/suggest-tag-colors', authMiddleware, suggestTagColors);
router.post('/:id/update-tags', authMiddleware, updateInvoiceTags);
router.patch('/:id/review-flag', authMiddleware, authorizeRoles('admin','approver'), setReviewFlag);
router.patch('/:id/flag', authMiddleware, authorizeRoles('approver'), setFlaggedStatus);
router.get('/logs', authMiddleware, authorizeRoles('admin'), getActivityLogs);
router.get('/logs/export', authMiddleware, authorizeRoles('admin'), exportComplianceReport);
router.get('/logs/export-csv', authMiddleware, authorizeRoles('admin'), exportActivityLogsCSV);
router.get('/logs/invoice/:id/export', authMiddleware, authorizeRoles('admin'), exportInvoiceHistory);
router.get('/logs/vendor/:vendor/export', authMiddleware, authorizeRoles('admin'), exportVendorHistory);
router.get('/:id/timeline', authMiddleware, getInvoiceTimeline);
router.get('/audit', authMiddleware, authorizeRoles('admin'), getAuditTrail);
router.patch('/audit/:id', authMiddleware, authorizeRoles('admin'), updateAuditEntry);
router.delete('/audit/:id', authMiddleware, authorizeRoles('admin'), deleteAuditEntry);
router.post('/budgets', authMiddleware, authorizeRoles('admin'), setBudget);
router.get('/budgets', authMiddleware, authorizeRoles('admin'), getBudgets);
router.get('/budgets/warnings', authMiddleware, checkBudgetWarnings);
router.get('/budgets/department-report', authMiddleware, getBudgetVsActual);
router.get('/budgets/forecast', authMiddleware, getBudgetForecast);
router.get('/anomalies', authMiddleware, getAnomalies);
router.get('/fraud/patterns', authMiddleware, authorizeRoles('admin'), detectPatterns);
router.get('/fraud/heatmap', authMiddleware, authorizeRoles('admin'), fraudHeatmap);
router.get('/fraud/flagged', authMiddleware, authorizeRoles('admin','approver'), require('../controllers/fraudController').flaggedInvoices);
router.get('/fraud/ml-detect', authMiddleware, authorizeRoles('admin'), mlDetect);
router.post('/fraud/:id/label', authMiddleware, authorizeRoles('admin'), labelFraud);
router.get('/:id/check-recurring', authMiddleware, checkRecurringInvoice);
router.get('/vendor-scorecards', authMiddleware, getVendorScorecards);
router.get('/graph', authMiddleware, getRelationshipGraph);


// ✅ GET PDF download
router.get('/:id/pdf', authMiddleware, generateInvoicePDF);
router.get('/:id/payment-request', authMiddleware, paymentRequest);
router.get('/:id/payment-request/pdf', authMiddleware, paymentRequestPDF);
router.post('/share', authMiddleware, authorizeRoles('admin','approver'), shareInvoices);
router.get('/shared/:token', getSharedInvoices);
router.get('/:id/versions', authMiddleware, getInvoiceVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, authorizeRoles('admin'), restoreInvoiceVersion);
router.post('/:id/blockchain-hash', authMiddleware, authorizeRoles('admin'), require('../controllers/blockchainController').recordHash);
router.get('/:id/blockchain-status', authMiddleware, require('../controllers/blockchainController').verifyHash);






module.exports = router;
