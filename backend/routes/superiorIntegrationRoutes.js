const express = require('express');
const router = express.Router();
const SuperiorIntegrationController = require('../controllers/superiorIntegrationController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const integrationController = new SuperiorIntegrationController();

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

// Integration CRUD operations
router.get('/integrations', integrationController.getIntegrations.bind(integrationController));
router.post('/integrations', integrationController.createIntegration.bind(integrationController));
router.delete('/integrations/:integrationId', integrationController.deleteIntegration.bind(integrationController));

// Integration management
router.post('/integrations/test', integrationController.testIntegration.bind(integrationController));
router.put('/integrations/:integrationId/toggle', integrationController.toggleIntegration.bind(integrationController));
router.post('/integrations/:integrationId/sync', integrationController.syncIntegration.bind(integrationController));

// Integration logs
router.get('/integrations/:integrationId/logs', integrationController.getIntegrationLogs.bind(integrationController));

module.exports = router; 