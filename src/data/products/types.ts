import { z } from "zod";

import { EntityIdSchema } from "@/lib/validations/ids";

export const AvailableProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  categoryId: z.string(),
  categoryName: z.string(),
  subcategoryId: z.string(),
  subcategoryName: z.string(),
});
export type AvailableProduct = z.infer<typeof AvailableProductSchema>;

export const ProductSchema = AvailableProductSchema.extend({
  isActive: z.boolean(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductsQuerySchema = z.object({
  search: z.string().trim().max(100).optional().catch(undefined),
  category: EntityIdSchema.optional().catch(undefined),
  subcategory: EntityIdSchema.optional().catch(undefined),
  status: z.enum(["active", "inactive"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
