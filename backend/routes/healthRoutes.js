import express from 'express';
const router = express.Router();

router.head('/', (req, res) => {
  res.status(200).end();
});

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res
    .status(200)
    .json({ ok: true, service: 'clarifyops-api', time: new Date().toISOString() });
});

export default router;
