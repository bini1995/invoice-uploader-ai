import express from 'express';
import multer from 'multer';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import {
  uploadLogo,
  getLogo,
  setAccentColor,
  getAccentColor,
} from '../controllers/brandingController.js';

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });
router.get('/', getLogo);
router.post('/', uploadLimiter, authMiddleware, authorizeRoles('admin'), upload.single('logo'), uploadLogo);
router.get('/color', getAccentColor);
router.post('/color', authMiddleware, authorizeRoles('admin'), setAccentColor);

export default router;
