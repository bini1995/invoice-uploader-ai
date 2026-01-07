import express from 'express';
import { validateHeaders, validateRow, listRules, addRule } from '../controllers/validationController.js';
import { authMiddleware } from '../controllers/userController.js';
const router = express.Router();

router.post('/validate-headers', authMiddleware, validateHeaders);
router.post('/validate-row', authMiddleware, validateRow);
router.get('/rules', authMiddleware, listRules);
router.post('/rules', authMiddleware, addRule);

export default router;
