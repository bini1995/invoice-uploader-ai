const express = require('express');
const router = express.Router();
const { handleZapier, listPublicInvoices } = require('../controllers/integrationController');

router.post('/zapier', handleZapier);
router.get('/public/invoices', listPublicInvoices);

module.exports = router;
