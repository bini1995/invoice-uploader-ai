const express = require('express');
const router = express.Router();
const {
  handleZapier,
  listPublicInvoices,
  guidewireTrigger,
  duckCreekTrigger,
} = require('../controllers/integrationController');

router.post('/zapier', handleZapier);
router.post('/zapier/guidewire', guidewireTrigger);
router.post('/zapier/duckcreek', duckCreekTrigger);
router.get('/public/invoices', listPublicInvoices);

module.exports = router;
