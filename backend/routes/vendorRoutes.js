const express = require('express');
const router = express.Router();
const { listVendors, updateVendorNotes, getVendorInfo } = require('../controllers/vendorController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, listVendors);
router.patch('/:vendor/notes', authMiddleware, authorizeRoles('admin'), updateVendorNotes);
router.get('/:vendor/info', authMiddleware, getVendorInfo);

module.exports = router;
