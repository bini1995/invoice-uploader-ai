import express from 'express';
import {
  handleZapier,
  listPublicInvoices,
  guidewireTrigger,
  duckCreekTrigger,
  handleErpWebhook,
  handleEpicWebhook,
  handleEhrWebhook,
} from '../controllers/integrationController.js';

const router = express.Router();

router.post('/zapier', handleZapier);
router.post('/zapier/guidewire', guidewireTrigger);
router.post('/zapier/duckcreek', duckCreekTrigger);
router.post('/erp/webhook', handleErpWebhook);
router.post('/erp/:provider/webhook', handleErpWebhook);
router.post('/ehr/epic/webhook', handleEpicWebhook);
router.post('/ehr/:provider/webhook', handleEhrWebhook);
router.get('/public/claims', listPublicInvoices);

export default router;
