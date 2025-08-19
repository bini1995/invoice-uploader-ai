const express = require('express');
const router = express.Router();
const SuperiorWorkflowController = require('../controllers/superiorWorkflowController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const workflowController = new SuperiorWorkflowController();

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

// Workflow CRUD operations
router.post('/workflows', workflowController.createWorkflow.bind(workflowController));
router.get('/workflows', workflowController.getWorkflows.bind(workflowController));
router.get('/workflows/:workflowId', workflowController.getWorkflow.bind(workflowController));

// Workflow deployment and execution
router.post('/workflows/:workflowId/deploy', workflowController.deployWorkflow.bind(workflowController));
router.post('/workflows/:workflowId/execute', workflowController.executeWorkflow.bind(workflowController));

// AI-powered workflow suggestions
router.post('/workflows/ai-suggestions', workflowController.generateAISuggestions.bind(workflowController));

module.exports = router; 