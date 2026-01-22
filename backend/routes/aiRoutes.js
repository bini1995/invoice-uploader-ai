import express from 'express';
import multer from 'multer';
import { analyzeClaimImage, categorizeDocument, categoryFeedback } from '../controllers/aiController.js';
import { authMiddleware } from '../controllers/userController.js';
import { aiLimiter } from '../middleware/rateLimit.js';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(aiLimiter);

router.post('/categorize', authMiddleware, categorizeDocument);
router.post('/categorize/:id/feedback', authMiddleware, categoryFeedback);
router.post('/claims/vision', authMiddleware, upload.single('image'), analyzeClaimImage);

export default router;
