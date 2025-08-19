const express = require('express');
const router = express.Router();
const SuperiorClaimsController = require('../controllers/superiorClaimsController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const claimsController = new SuperiorClaimsController();

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

// Claims CRUD operations
router.post('/claims', claimsController.createClaim.bind(claimsController));
router.get('/claims', claimsController.getClaims.bind(claimsController));
router.get('/claims/:claimId', claimsController.getClaim.bind(claimsController));
router.put('/claims/:claimId', claimsController.updateClaim.bind(claimsController));

// Document management
router.post('/claims/:claimId/documents', claimsController.uploadDocuments.bind(claimsController));

// Comments and communication
router.post('/claims/:claimId/comments', claimsController.addComment.bind(claimsController));

// Analytics and reporting
router.get('/analytics/fraud-statistics', claimsController.getFraudStatistics.bind(claimsController));

module.exports = router; 