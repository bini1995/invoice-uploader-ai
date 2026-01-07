import express from 'express';
import { authMiddleware } from '../controllers/userController.js';
import { createSigningRequest } from '../controllers/signingController.js';
const router = express.Router();

router.post('/:id/start', authMiddleware, createSigningRequest);

export default router;
