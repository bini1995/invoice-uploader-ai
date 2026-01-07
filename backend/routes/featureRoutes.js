import express from 'express';
import { submitFeature, listFeatures } from '../controllers/featureController.js';
import { authMiddleware } from '../controllers/userController.js';
const router = express.Router();

router.post('/', authMiddleware, submitFeature);
router.get('/', authMiddleware, listFeatures);

export default router;
