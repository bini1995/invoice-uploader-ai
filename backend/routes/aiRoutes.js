import express from 'express';
import { categorizeDocument, categoryFeedback } from '../controllers/aiController.js';
import { authMiddleware } from '../controllers/userController.js';
import { aiLimiter } from '../middleware/rateLimit.js';
const router = express.Router();

router.use(aiLimiter);

router.post('/categorize', authMiddleware, categorizeDocument);
router.post('/categorize/:id/feedback', authMiddleware, categoryFeedback);

export default router;
