
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { exportFilteredInvoices, exportAllInvoices } = require('../controllers/invoiceController');

const { login, authMiddleware, authorizeRoles } = require('../controllers/userController');

const {
  uploadInvoiceCSV,
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
} = require('../controllers/invoiceController');


const { summarizeUploadErrors } = require('../controllers/aiController');
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
const { assignInvoice } = require('../controllers/invoiceController');
const { approveInvoice, rejectInvoice, addComment } = require('../controllers/invoiceController');
const { getActivityLogs } = require('../controllers/activityController');


router.get('/export-archived', authMiddleware, exportArchivedInvoicesCSV);
router.get('/:id/pdf', generateInvoicePDF);
router.post('/:id/mark-paid', authMiddleware, markInvoicePaid);
router.post('/suggest-vendor', suggestVendor);
router.post('/send-email', sendSummaryEmail);
router.post('/upload', authMiddleware, authorizeRoles('admin'), upload.single('invoiceFile'), uploadInvoiceCSV);
router.get('/', getAllInvoices);
router.delete('/clear', authMiddleware, authorizeRoles('admin'), clearAllInvoices);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteInvoiceById);
router.get('/search', searchInvoicesByVendor);
router.post('/nl-query', authMiddleware, naturalLanguageQuery);
router.post('/summarize-errors', summarizeUploadErrors);
router.post('/login', login);
router.post('/export-filtered', authMiddleware, exportFilteredInvoicesCSV);
router.get('/export-all', authMiddleware, exportAllInvoices);
router.post('/summarize-vendor-data', summarizeVendorData);
router.get('/monthly-insights', authMiddleware, getMonthlyInsights);
router.get('/cash-flow', authMiddleware, getCashFlow);
router.get('/top-vendors', authMiddleware, getTopVendors);
router.post('/flag-suspicious', authMiddleware, flagSuspiciousInvoice);
router.patch('/:id/archive', authMiddleware, archiveInvoice);
router.post('/:id/unarchive', authMiddleware, unarchiveInvoice);
router.post('/suggest-vendor', authMiddleware, handleSuggestion);
router.patch('/:id/update', authMiddleware, updateInvoiceField);
router.patch('/:id/assign', authMiddleware, assignInvoice);
router.patch('/:id/approve', authMiddleware, authorizeRoles('approver','admin'), approveInvoice);
router.patch('/:id/reject', authMiddleware, authorizeRoles('approver','admin'), rejectInvoice);
router.post('/:id/comments', authMiddleware, authorizeRoles('approver','admin'), addComment);
router.post('/suggest-tags', authMiddleware, suggestTags);
router.post('/:id/update-tags', authMiddleware, updateInvoiceTags);
router.get('/logs', authMiddleware, authorizeRoles('admin'), getActivityLogs);


// ✅ GET PDF download
router.get('/:id/pdf', authMiddleware, generateInvoicePDF);






module.exports = router;
