import { z } from 'zod';

const roles = ['admin', 'viewer', 'broker', 'adjuster', 'medical_reviewer', 'auditor', 'internal_ops'];

export const userIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User id must be a number')
});

export const addUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(roles)
});

export const updateUserRoleSchema = z.object({
  role: z.enum(roles)
});
