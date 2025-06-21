const express = require('express');
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require('../controllers/userController');
const {
  getTemplates,
  createTemplate,
  deleteTemplate,
  exportWithTemplate,
} = require('../controllers/exportTemplateController');

router.get('/', authMiddleware, getTemplates);
router.post('/', authMiddleware, createTemplate);
router.delete('/:id', authMiddleware, deleteTemplate);
router.get('/:id/export', authMiddleware, exportWithTemplate);

module.exports = router;
