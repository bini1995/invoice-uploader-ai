const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  uploadInvoiceCSV,
  getAllInvoices
} = require('../controllers/invoiceController');

// ✅ Add this new line to bring in the AI controller
const { summarizeUploadErrors } = require('../controllers/aiController');

const router = express.Router();

router.post('/upload', upload.single('invoiceFile'), uploadInvoiceCSV);
router.get('/', getAllInvoices);

// ✅ Register the AI summarizer route correctly here:
router.post('/summarize-errors', summarizeUploadErrors);

module.exports = router;
