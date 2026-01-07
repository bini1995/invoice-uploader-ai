import express from 'express';
import { register } from '../metrics.js';
const router = express.Router();
const METRICS_KEY = process.env.METRICS_API_KEY;
router.use((req, res, next) => {
  if (!METRICS_KEY) return next();
  if (req.headers["x-api-key"] === METRICS_KEY) return next();
  return res.status(401).send("Unauthorized");
});

router.get('/', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default router;
