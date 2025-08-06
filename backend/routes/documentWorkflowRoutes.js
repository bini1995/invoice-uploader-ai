const express = require('express');
const router = express.Router();
const {
  getWorkflows,
  setWorkflow,
  evaluateWorkflow,
  getInsuranceWorkflow,
} = require('../controllers/workflowController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), getWorkflows);
router.post('/', authMiddleware, authorizeRoles('admin'), setWorkflow);
router.post('/evaluate', authMiddleware, authorizeRoles('admin'), evaluateWorkflow);
router.get(
  '/insurance',
  authMiddleware,
  authorizeRoles('admin'),
  getInsuranceWorkflow,
);

module.exports = router;
