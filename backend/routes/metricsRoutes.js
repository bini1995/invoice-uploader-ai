const express = require('express');
const router = express.Router();
const { register } = require('../metrics');
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

module.exports = router;
