import express from 'express';
import {
  handleZapier,
  listPublicInvoices,
  guidewireTrigger,
  duckCreekTrigger,
} from '../controllers/integrationController.js';

const router = express.Router();

router.post('/zapier', handleZapier);
router.post('/zapier/guidewire', guidewireTrigger);
router.post('/zapier/duckcreek', duckCreekTrigger);
router.get('/public/invoices', listPublicInvoices);

export default router;
