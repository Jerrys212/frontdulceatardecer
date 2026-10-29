import { z } from "zod";

import { catalogNameSchema, priceSchema } from "@/lib/validations/catalog";
import { selectedIdSchema } from "@/lib/validations/ids";

export const ProductFormSchema = z.object({
  name: catalogNameSchema(100),
  description: z
    .string()
    .trim()
    .max(250, "La descripción no puede tener más de 250 caracteres")
    .transform((description) => (description === "" ? null : description)),
  price: priceSchema({ allowZero: false }),
  categoryId: selectedIdSchema("Selecciona una categoría"),
  subcategoryId: selectedIdSchema("Selecciona una subcategoría"),
});
export type ProductFormInput = z.input<typeof ProductFormSchema>;
export type ProductFormOutput = z.output<typeof ProductFormSchema>;
