import express from 'express';
import portal from '../controllers/vendorPortalController.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
const router = express.Router();

router.post('/login', portal.login);
router.use(portal.auth);
router.get('/invoices', portal.listInvoices);
router.post('/upload', uploadLimiter, portal.uploadInvoice);
router.get('/bank', portal.getBankInfo);
router.patch('/bank', portal.updateBankInfo);
router.get('/payments', portal.paymentStatus);

export default router;
