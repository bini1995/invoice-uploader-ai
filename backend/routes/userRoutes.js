import express from 'express';
import {
  getUsers,
  addUser,
  deleteUser,
  updateUserRole,
  authMiddleware,
  authorizeRoles
} from '../controllers/userController.js';

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), getUsers);
router.post('/', authMiddleware, authorizeRoles('admin'), addUser);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);
router.patch('/:id/role', authMiddleware, authorizeRoles('admin'), updateUserRole);

export default router;
