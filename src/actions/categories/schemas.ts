import { z } from "zod";

import { catalogNameSchema } from "@/lib/validations/catalog";

export const MAX_SUBCATEGORIES_ON_CREATE = 50;

const CatalogNameSchema = catalogNameSchema();

export const NameSchema = z.object({ name: CatalogNameSchema });
export type NameInput = z.input<typeof NameSchema>;

export const CreateCategorySchema = z
  .object({
    name: CatalogNameSchema,
    subcategories: z
      .array(z.object({ name: CatalogNameSchema }))
      .max(MAX_SUBCATEGORIES_ON_CREATE, `Puedes agregar hasta ${MAX_SUBCATEGORIES_ON_CREATE} subcategorías`),
  })
  .superRefine(({ subcategories }, context) => {
    const seen = new Set<string>();
    subcategories.forEach(({ name }, index) => {
      const key = name.trim().toLocaleLowerCase("es-MX");
      if (seen.has(key)) {
        context.addIssue({
          code: "custom",
          path: ["subcategories", index, "name"],
          message: "Esta subcategoría está repetida",
        });
      }
      seen.add(key);
    });
  });
export type CreateCategoryInput = z.input<typeof CreateCategorySchema>;
