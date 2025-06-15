const express = require('express');
const router = express.Router();
const { getWorkflows, setWorkflow } = require('../controllers/workflowController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), getWorkflows);
router.post('/', authMiddleware, authorizeRoles('admin'), setWorkflow);

module.exports = router;
