import express from 'express';
import { authMiddleware } from '../controllers/userController.js';
import { getOpsTimeline } from '../controllers/timelineController.js';
const router = express.Router();

router.get('/', authMiddleware, getOpsTimeline);

export default router;
