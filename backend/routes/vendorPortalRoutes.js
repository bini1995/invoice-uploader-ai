const express = require('express');
const router = express.Router();
const portal = require('../controllers/vendorPortalController');

router.post('/login', portal.login);
router.use(portal.auth);
router.get('/invoices', portal.listInvoices);
router.post('/upload', portal.uploadInvoice);
router.get('/bank', portal.getBankInfo);
router.patch('/bank', portal.updateBankInfo);
router.get('/payments', portal.paymentStatus);

module.exports = router;
