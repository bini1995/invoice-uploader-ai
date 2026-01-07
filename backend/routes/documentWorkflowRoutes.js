import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import {
  getWorkflows,
  setWorkflow,
  evaluateWorkflow,
  getInsuranceWorkflow,
} from '../controllers/workflowController.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin'), (req, res) => {
  if (req.query.type === 'insurance') {
    return getInsuranceWorkflow(req, res);
  }
  return getWorkflows(req, res);
});
router.post('/', authMiddleware, authorizeRoles('admin'), setWorkflow);
router.post('/evaluate', authMiddleware, authorizeRoles('admin'), evaluateWorkflow);
router.get(
  '/insurance',
  authMiddleware,
  authorizeRoles('admin'),
  getInsuranceWorkflow,
);

export default router;
