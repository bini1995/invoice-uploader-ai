import crypto from 'crypto';

const formatSignature = (value) => (value ? value.trim() : '');

const buildPayload = (req) => {
  if (req.rawBody) return req.rawBody.toString('utf8');
  return JSON.stringify(req.body || {});
};

export const verifyClaimWebhookSignature = (req, res, next) => {
  const secret = process.env.CLAIM_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'CLAIM_WEBHOOK_SECRET not configured' });
  }

  const signatureHeader = formatSignature(req.get('X-Webhook-Signature'));
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return res.status(401).json({ message: 'Missing webhook signature' });
  }

  const payload = buildPayload(req);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expectedSignature = `sha256=${expected}`;

  if (signatureHeader.length !== expectedSignature.length) {
    return res.status(401).json({ message: 'Invalid webhook signature' });
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expectedSignature)
  );
  if (!valid) {
    return res.status(401).json({ message: 'Invalid webhook signature' });
  }

  return next();
};
