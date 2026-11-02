import { z } from "zod";

export const SaleStatusSchema = z.enum(["Preparing", "Paid", "Cancelled"]);
export type SaleStatus = z.infer<typeof SaleStatusSchema>;

export const PaymentMethodSchema = z.enum(["Cash", "Card", "Transfer"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const SaleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  categoryName: z.string(),
  subcategoryName: z.string(),
  unitPrice: z.number(),
  quantity: z.number().int(),
  amount: z.number(),
  note: z.string().nullable(),
  extras: z.array(
    z.object({
      extraId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int(),
    }),
  ),
});
export type SaleItem = z.infer<typeof SaleItemSchema>;

export const SaleSchema = z.object({
  id: z.string(),
  status: SaleStatusSchema,
  customerDescription: z.string().nullable(),
  createdAt: z.string(),
  cashierName: z.string(),
  items: z.array(SaleItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  paymentMethod: PaymentMethodSchema.nullable(),
  paidAt: z.string().nullable(),
  cancelReason: z.string().nullable(),
  cancelledAt: z.string().nullable(),
});
export type Sale = z.infer<typeof SaleSchema>;

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  Preparing: "En preparación",
  Paid: "Pagada",
  Cancelled: "Cancelada",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  Cash: "Efectivo",
  Card: "Tarjeta",
  Transfer: "Transferencia",
};

export function saleNumber(id: string) {
  return `#${id.replace(/-/g, "").slice(-6).toUpperCase()}`;
}

export const SALES_PAGE_SIZE = 20;

export const SalesQuerySchema = z.object({
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  status: SaleStatusSchema.optional().catch(undefined),
  paymentMethod: PaymentMethodSchema.optional().catch(undefined),
  cashierId: z.string().trim().min(1).max(450).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});
export type SalesQuery = z.infer<typeof SalesQuerySchema>;
