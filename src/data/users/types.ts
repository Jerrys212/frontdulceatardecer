import { z } from "zod";

import { RoleSchema } from "@/data/auth/types";
import { EntityIdSchema } from "@/lib/validations/ids";

export const UserIdSchema = EntityIdSchema;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  role: RoleSchema,
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
  deactivatedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
});
export type Session = z.infer<typeof SessionSchema>;

export const TemporaryPasswordSchema = z.object({
  temporaryPassword: z.string().min(1),
});

export const CreateUserResponseSchema = TemporaryPasswordSchema.extend({
  user: UserSchema,
});

export const USERS_PAGE_SIZE = 10;

export const UserStatusSchema = z.enum(["active", "inactive"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UsersQuerySchema = z.object({
  search: z.string().trim().max(100).optional().catch(undefined),
  role: RoleSchema.optional().catch(undefined),
  status: UserStatusSchema.optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});
export type UsersQuery = z.infer<typeof UsersQuerySchema>;
