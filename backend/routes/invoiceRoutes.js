
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { exportFilteredInvoices, exportAllInvoices } = require('../controllers/invoiceController');

const { login, authMiddleware } = require('../controllers/userController');

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


router.get('/export-archived', authMiddleware, exportArchivedInvoicesCSV);
router.get('/:id/pdf', generateInvoicePDF);
router.post('/:id/mark-paid', authMiddleware, markInvoicePaid);
router.post('/suggest-vendor', suggestVendor);
router.post('/send-email', sendSummaryEmail);
router.post('/upload', authMiddleware, upload.single('invoiceFile'), uploadInvoiceCSV);
router.get('/', getAllInvoices);
router.delete('/clear', authMiddleware, clearAllInvoices);
router.delete('/:id', authMiddleware, deleteInvoiceById);
router.get('/search', searchInvoicesByVendor);
router.post('/nl-query', authMiddleware, naturalLanguageQuery);
router.post('/summarize-errors', summarizeUploadErrors);
router.post('/login', login);
router.post('/export-filtered', authMiddleware, exportFilteredInvoicesCSV);
router.get('/export-all', authMiddleware, exportAllInvoices);
router.post('/summarize-vendor-data', summarizeVendorData);
router.get('/monthly-insights', authMiddleware, getMonthlyInsights);
router.post('/flag-suspicious', authMiddleware, flagSuspiciousInvoice);
router.patch('/:id/archive', authMiddleware, archiveInvoice);
router.post('/:id/unarchive', authMiddleware, unarchiveInvoice);
router.post('/suggest-vendor', authMiddleware, handleSuggestion);
router.patch('/:id/update', authMiddleware, updateInvoiceField);
router.post('/suggest-tags', authMiddleware, suggestTags);
router.post('/:id/update-tags', authMiddleware, updateInvoiceTags);


// ✅ GET PDF download
router.get('/:id/pdf', authMiddleware, generateInvoicePDF);






module.exports = router;
