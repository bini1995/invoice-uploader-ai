import express from 'express';
import { authMiddleware } from '../controllers/userController.js';
import {
  createKey,
  listKeys,
  deleteKey,
  updateLabel,
} from '../controllers/apiKeyController.js';

const router = express.Router();
router.post('/', authMiddleware, createKey);
router.get('/', authMiddleware, listKeys);
router.delete('/:id', authMiddleware, deleteKey);
router.patch('/:id', authMiddleware, updateLabel);

export default router;
