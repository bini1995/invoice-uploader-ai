import express from 'express';
import { authMiddleware } from '../controllers/userController.js';
import {
  getTemplates,
  createTemplate,
  deleteTemplate,
  exportWithTemplate,
} from '../controllers/exportTemplateController.js';

const router = express.Router({ mergeParams: true });

router.get('/', authMiddleware, getTemplates);
router.post('/', authMiddleware, createTemplate);
router.delete('/:id', authMiddleware, deleteTemplate);
router.get('/:id/export', authMiddleware, exportWithTemplate);

export default router;
