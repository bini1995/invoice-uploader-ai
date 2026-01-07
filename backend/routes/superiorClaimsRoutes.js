import express from 'express';
import claimRoutes from './claimRoutes.js';

const router = express.Router();

router.use('/claims', claimRoutes);

export default router;
