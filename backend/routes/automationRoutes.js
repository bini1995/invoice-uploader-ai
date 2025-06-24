const express = require('express');
const router = express.Router();
const {
  listAutomations,
  addAutomation,
  updateAutomation,
  deleteAutomation,
} = require('../controllers/automationController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), listAutomations);
router.post('/', authMiddleware, authorizeRoles('admin'), addAutomation);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateAutomation);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteAutomation);

module.exports = router;
