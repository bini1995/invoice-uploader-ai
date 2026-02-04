import express from 'express';
import { getMarketCandles, isSupportedInterval } from './marketDataService.js';

const router = express.Router();

router.get('/candles', async (req, res, next) => {
  try {
    const symbol = (req.query.symbol || '').toString().trim().toUpperCase();
    const interval = (req.query.interval || '').toString().trim();
    const limitRaw = Number(req.query.limit || 200);
    const limit = Number.isNaN(limitRaw) ? 200 : Math.max(1, Math.min(1000, limitRaw));

    if (!symbol) {
      return res.status(400).json({ error: 'symbol query parameter is required' });
    }

    if (!interval) {
      return res.status(400).json({ error: 'interval query parameter is required' });
    }

    if (!isSupportedInterval(interval)) {
      return res.status(400).json({
        error: 'Unsupported interval. Only 1d and 1h are supported for now.',
      });
    }

    const payload = await getMarketCandles({ symbol, interval, limit });
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

export default router;
