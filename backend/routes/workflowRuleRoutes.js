import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import {
  listWorkflowRules,
  addWorkflowRule,
  updateWorkflowRule,
  deleteWorkflowRule,
} from '../controllers/workflowRulesController.js';

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), listWorkflowRules);
router.post('/', authMiddleware, authorizeRoles('admin'), addWorkflowRule);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateWorkflowRule);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteWorkflowRule);

export default router;
