import express from 'express';
import {
  getUsers,
  addUser,
  deleteUser,
  updateUserRole,
  authMiddleware,
  authorizeRoles
} from '../controllers/userController.js';
import validateRequest from '../middleware/validateRequest.js';
import { addUserSchema, updateUserRoleSchema, userIdParamsSchema } from '../validation/userSchemas.js';

const router = express.Router();
router.get('/', authMiddleware, authorizeRoles('admin'), getUsers);
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  validateRequest({ body: addUserSchema }),
  addUser
);
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  validateRequest({ params: userIdParamsSchema }),
  deleteUser
);
router.patch(
  '/:id/role',
  authMiddleware,
  authorizeRoles('admin'),
  validateRequest({ params: userIdParamsSchema, body: updateUserRoleSchema }),
  updateUserRole
);

export default router;
