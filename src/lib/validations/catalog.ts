import { z } from "zod";

import { MONEY_PATTERN } from "@/lib/money";

export const MAX_PRICE = 9999.99;

export function catalogNameSchema(maxLength = 50) {
  return z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(maxLength, `El nombre no puede tener más de ${maxLength} caracteres`);
}

export function priceSchema({ allowZero }: { allowZero: boolean }) {
  const minimum = allowZero ? 0 : 0.01;
  const rangeMessage = allowZero
    ? "El precio debe estar entre $0.00 y $9,999.99"
    : "El precio debe ser mayor a $0 y no superar $9,999.99";

  return z
    .string()
    .trim()
    .min(1, { error: "Ingresa el precio", abort: true })
    .regex(MONEY_PATTERN, "Usa un número con máximo 2 decimales, por ejemplo 15 o 15.50")
    .transform(Number)
    .refine((price) => price >= minimum && price <= MAX_PRICE, rangeMessage);
}
