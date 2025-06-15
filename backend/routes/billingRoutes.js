const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/billingController');

router.post('/checkout', createCheckoutSession);

module.exports = router;
