import { z } from "zod";

import { RoleSchema } from "@/data/auth/types";

const FullNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(100, "El nombre no puede tener más de 100 caracteres");

const RoleFieldSchema = RoleSchema.or(z.literal("")).refine((role) => role !== "", "Selecciona un rol");

export const CreateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede tener más de 50 caracteres")
    .regex(/^[A-Za-z0-9._-]+$/, "Usa solo letras, números, punto, guion o guion bajo"),
  fullName: FullNameSchema,
  role: RoleFieldSchema,
});
export type CreateUserInput = z.input<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  fullName: FullNameSchema,
  role: RoleFieldSchema,
});
export type UpdateUserInput = z.input<typeof UpdateUserSchema>;
