const express = require('express');
const router = express.Router();
const {
  listWorkflowRules,
  addWorkflowRule,
  updateWorkflowRule,
  deleteWorkflowRule,
} = require('../controllers/workflowRulesController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), listWorkflowRules);
router.post('/', authMiddleware, authorizeRoles('admin'), addWorkflowRule);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateWorkflowRule);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteWorkflowRule);

module.exports = router;
