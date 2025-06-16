const express = require('express');
const router = express.Router();
const { createPaymentLink, stripeWebhook } = require('../controllers/paymentController');

router.post('/:id/link', createPaymentLink);
router.post('/stripe/webhook', express.json({ type: 'application/json' }), stripeWebhook);

module.exports = router;
