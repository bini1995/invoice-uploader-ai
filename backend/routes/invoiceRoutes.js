
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { exportFilteredInvoices, exportAllInvoices } = require('../controllers/invoiceController');

const { login, authMiddleware, authorizeRoles } = require('../controllers/userController');

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
  bulkAutoCategorize,
  getVendorBio,
} = require('../controllers/invoiceController');


const { summarizeUploadErrors } = require('../controllers/aiController');
const { invoiceQualityScore, assistantQuery } = require('../controllers/aiController');
const router = express.Router();
const { sendSummaryEmail } = require('../controllers/emailController');
const { summarizeVendorData } = require('../controllers/aiController');
const { suggestVendor } = require('../controllers/aiController');
const { naturalLanguageQuery } = require("../controllers/aiController");
const { flagSuspiciousInvoice } = require('../controllers/invoiceController');
const { markInvoicePaid } = require('../controllers/invoiceController');
const { handleSuggestion } = require('../controllers/invoiceController');
const { suggestTags } = require('../controllers/invoiceController');
const { updateInvoiceTags } = require('../controllers/invoiceController');
const { generateInvoicePDF } = require('../controllers/invoiceController');
const { getActivityLogs, getInvoiceTimeline } = require('../controllers/activityController');
const { setBudget, getBudgets, checkBudgetWarnings } = require('../controllers/budgetController');
const { getAnomalies } = require('../controllers/anomalyController');


router.get('/export-archived', authMiddleware, exportArchivedInvoicesCSV);
router.post('/:id/mark-paid', authMiddleware, markInvoicePaid);
router.post('/suggest-vendor', suggestVendor);
router.post('/send-email', sendSummaryEmail);
router.post('/upload', authMiddleware, authorizeRoles('admin'), upload.single('invoiceFile'), uploadInvoice);
router.get('/', getAllInvoices);
router.delete('/clear', authMiddleware, authorizeRoles('admin'), clearAllInvoices);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteInvoiceById);
router.get('/search', searchInvoicesByVendor);
router.post('/nl-query', authMiddleware, naturalLanguageQuery);
router.post('/quality-score', authMiddleware, invoiceQualityScore);
router.post('/assistant', authMiddleware, assistantQuery);
router.post('/summarize-errors', summarizeUploadErrors);
router.post('/login', login);
router.post('/export-filtered', authMiddleware, exportFilteredInvoicesCSV);
router.get('/export-all', authMiddleware, exportAllInvoices);
router.post('/summarize-vendor-data', summarizeVendorData);
router.get('/monthly-insights', authMiddleware, getMonthlyInsights);
router.get('/cash-flow', authMiddleware, getCashFlow);
router.get('/top-vendors', authMiddleware, getTopVendors);
router.get('/spending-by-tag', authMiddleware, getSpendingByTag);
router.get('/recurring/insights', authMiddleware, getRecurringInsights);
router.get('/vendor-profile/:vendor', authMiddleware, getVendorProfile);
router.get('/vendor-bio/:vendor', authMiddleware, getVendorBio);
router.get('/dashboard/pdf', authMiddleware, exportDashboardPDF);
router.post('/flag-suspicious', authMiddleware, flagSuspiciousInvoice);
router.get('/:id/flag-explanation', authMiddleware, explainFlaggedInvoice);
router.patch('/:id/archive', authMiddleware, archiveInvoice);
router.post('/:id/unarchive', authMiddleware, unarchiveInvoice);
router.post('/suggest-vendor', authMiddleware, handleSuggestion);
router.patch('/:id/update', authMiddleware, updateInvoiceField);
router.patch('/:id/assign', authMiddleware, assignInvoice);
router.patch('/:id/approve', authMiddleware, authorizeRoles('approver','admin'), approveInvoice);
router.patch('/:id/reject', authMiddleware, authorizeRoles('approver','admin'), rejectInvoice);
router.post('/:id/comments', authMiddleware, authorizeRoles('approver','admin'), addComment);
router.patch('/bulk/archive', authMiddleware, authorizeRoles('admin'), bulkArchiveInvoices);
router.patch('/bulk/assign', authMiddleware, authorizeRoles('admin'), bulkAssignInvoices);
router.patch('/bulk/approve', authMiddleware, authorizeRoles('approver','admin'), bulkApproveInvoices);
router.patch('/bulk/reject', authMiddleware, authorizeRoles('approver','admin'), bulkRejectInvoices);
router.post('/bulk/pdf', authMiddleware, exportPDFBundle);
router.post('/bulk/auto-categorize', authMiddleware, bulkAutoCategorize);
router.patch('/:id/notes', authMiddleware, authorizeRoles('admin'), updatePrivateNotes);
router.patch('/:id/retention', authMiddleware, authorizeRoles('admin'), updateRetentionPolicy);
router.post('/suggest-tags', authMiddleware, suggestTags);
router.post('/:id/update-tags', authMiddleware, updateInvoiceTags);
router.get('/logs', authMiddleware, authorizeRoles('admin'), getActivityLogs);
router.get('/:id/timeline', authMiddleware, getInvoiceTimeline);
router.post('/budgets', authMiddleware, authorizeRoles('admin'), setBudget);
router.get('/budgets', authMiddleware, authorizeRoles('admin'), getBudgets);
router.get('/budgets/warnings', authMiddleware, checkBudgetWarnings);
router.get('/anomalies', authMiddleware, getAnomalies);
router.get('/:id/check-recurring', authMiddleware, checkRecurringInvoice);


// ✅ GET PDF download
router.get('/:id/pdf', authMiddleware, generateInvoicePDF);






module.exports = router;
