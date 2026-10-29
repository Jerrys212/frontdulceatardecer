import { z } from "zod";

export const SubcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});
export type Subcategory = z.infer<typeof SubcategorySchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  subcategories: z.array(SubcategorySchema),
});
export type Category = z.infer<typeof CategorySchema>;

export const ActiveCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  subcategories: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type ActiveCategory = z.infer<typeof ActiveCategorySchema>;
