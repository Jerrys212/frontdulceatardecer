import { z } from "zod";

import { PaymentMethodSchema } from "@/data/sales/types";
import {
  MAX_CUSTOMER_LENGTH,
  MAX_EXTRA_QUANTITY,
  MAX_LINE_QUANTITY,
  MAX_LINES,
  MAX_NOTE_LENGTH,
} from "@/lib/sales/cart";
import { EntityIdSchema } from "@/lib/validations/ids";

export const SaleRequestSchema = z.object({
  customerDescription: z
    .string()
    .trim()
    .max(MAX_CUSTOMER_LENGTH, `La descripción del cliente no puede tener más de ${MAX_CUSTOMER_LENGTH} caracteres`)
    .transform((value) => (value === "" ? null : value)),
  expectedTotal: z
    .number()
    .min(0)
    .transform((total) => Math.round(total * 100) / 100),
  items: z
    .array(
      z
        .object({
          productId: EntityIdSchema,
          quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY, `La cantidad por renglón va de 1 a ${MAX_LINE_QUANTITY}`),
          note: z
            .string()
            .max(MAX_NOTE_LENGTH, `La nota no puede tener más de ${MAX_NOTE_LENGTH} caracteres`)
            .nullable(),
          extras: z.array(
            z.object({
              extraId: EntityIdSchema,
              quantity: z.number().int().min(1).max(MAX_EXTRA_QUANTITY, `Cada extra va de 1 a ${MAX_EXTRA_QUANTITY}`),
            }),
          ),
        })
        .refine((item) => new Set(item.extras.map((extra) => extra.extraId)).size === item.extras.length, {
          error: "Un extra no puede repetirse dentro del mismo renglón",
        }),
    )
    .min(1, "Agrega al menos un producto al pedido")
    .max(MAX_LINES, `El pedido puede tener hasta ${MAX_LINES} renglones`),
});
export type SaleRequestInput = z.input<typeof SaleRequestSchema>;

export const IdempotencyKeySchema = z.string().min(1).max(100);

export const PaySaleSchema = z.object({ paymentMethod: PaymentMethodSchema });

export const CancelSaleSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Escribe un motivo de al menos 5 caracteres")
    .max(200, "El motivo no puede tener más de 200 caracteres"),
});
export type CancelSaleInput = z.input<typeof CancelSaleSchema>;
