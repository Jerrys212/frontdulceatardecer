import { z } from "zod";

import { catalogNameSchema, priceSchema } from "@/lib/validations/catalog";

export const ExtraFormSchema = z.object({
  name: catalogNameSchema(),
  price: priceSchema({ allowZero: true }),
});
export type ExtraFormInput = z.input<typeof ExtraFormSchema>;
export type ExtraFormOutput = z.output<typeof ExtraFormSchema>;
