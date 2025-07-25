const express = require('express');
const router = express.Router();
const {
  createKey,
  listKeys,
  deleteKey,
  updateLabel
} = require('../controllers/apiKeyController');
const { authMiddleware } = require('../controllers/userController');

router.post('/', authMiddleware, createKey);
router.get('/', authMiddleware, listKeys);
router.delete('/:id', authMiddleware, deleteKey);
router.patch('/:id', authMiddleware, updateLabel);

module.exports = router;
