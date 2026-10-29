import { z } from "zod";

export const MAX_SUBCATEGORIES_ON_CREATE = 50;

export const CatalogNameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(50, "El nombre no puede tener más de 50 caracteres");

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
