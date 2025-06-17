const express = require('express');
const router = express.Router();
const { submitFeature, listFeatures } = require('../controllers/featureController');
const { authMiddleware } = require('../controllers/userController');

router.post('/', authMiddleware, submitFeature);
router.get('/', authMiddleware, listFeatures);

module.exports = router;
