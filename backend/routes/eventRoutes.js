import express from 'express';
import { recordEvent } from '../controllers/eventController.js';
import { authMiddleware } from '../controllers/userController.js';
const router = express.Router();

router.post('/', authMiddleware, recordEvent);

export default router;
