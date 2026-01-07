import express from 'express';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import {
  listAutomations,
  addAutomation,
  updateAutomation,
  deleteAutomation,
} from '../controllers/automationController.js';

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), listAutomations);
router.post('/', authMiddleware, authorizeRoles('admin'), addAutomation);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateAutomation);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteAutomation);

export default router;
