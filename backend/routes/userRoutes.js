const express = require('express');
const router = express.Router();
const {
  getUsers,
  addUser,
  deleteUser,
  updateUserRole,
  authMiddleware,
  authorizeRoles
} = require('../controllers/userController');

router.get('/', authMiddleware, authorizeRoles('admin'), getUsers);
router.post('/', authMiddleware, authorizeRoles('admin'), addUser);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);
router.patch('/:id/role', authMiddleware, authorizeRoles('admin'), updateUserRole);

module.exports = router;
