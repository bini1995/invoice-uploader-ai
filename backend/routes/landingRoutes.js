
import express from 'express';
import rateLimit from 'express-rate-limit';
import { trackEvent } from '../utils/eventTracker.js';
const router = express.Router();
const formLimiter = rateLimit({ windowMs: 60 * 1000, max: 3 });

router.post('/landing', formLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    await trackEvent('default', null, 'landing_form_submit', { status: 'invalid' });
    return res.status(400).json({ message: 'Invalid email' });
  }
  await trackEvent('default', null, 'landing_form_submit', { status: 'success' });
  res.json({ ok: true });
});

export default router;
