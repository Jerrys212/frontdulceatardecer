import { z } from "zod";

export const RoleSchema = z.enum(["Admin", "Cashier", "Kitchen"]);
export type Role = z.infer<typeof RoleSchema>;

export const CurrentUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  role: RoleSchema,
  mustChangePassword: z.boolean(),
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

export const TokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const LoginResponseSchema = TokenResponseSchema.extend({
  user: CurrentUserSchema,
});
