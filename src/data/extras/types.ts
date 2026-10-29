import { z } from "zod";

export const ActiveExtraSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});
export type ActiveExtra = z.infer<typeof ActiveExtraSchema>;

export const ExtraSchema = ActiveExtraSchema.extend({
  isActive: z.boolean(),
});
export type Extra = z.infer<typeof ExtraSchema>;
