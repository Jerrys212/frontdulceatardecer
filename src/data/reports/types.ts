import { z } from "zod";

import { PaymentMethodSchema } from "@/data/sales/types";

export const ReportGroupingSchema = z.enum(["hour", "day", "week", "month"]);
export type ReportGrouping = z.infer<typeof ReportGroupingSchema>;

export const ReportPeriodSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});
export type ReportPeriod = z.infer<typeof ReportPeriodSchema>;

export const SalesSummarySchema = z.object({
  from: z.string(),
  to: z.string(),
  revenue: z.number(),
  subtotal: z.number(),
  tax: z.number(),
  salesCount: z.number().int(),
  averageTicket: z.number(),
  unitsSold: z.number().int(),
  cancelledCount: z.number().int(),
  cancelledAmount: z.number(),
  previous: z.object({
    from: z.string(),
    to: z.string(),
    revenue: z.number(),
    salesCount: z.number().int(),
    averageTicket: z.number(),
    revenueChangePercentage: z.number().nullable(),
    salesCountChangePercentage: z.number().nullable(),
    averageTicketChangePercentage: z.number().nullable(),
  }),
});
export type SalesSummary = z.infer<typeof SalesSummarySchema>;

export const SalesIntervalSchema = z.object({
  start: z.string(),
  revenue: z.number(),
  salesCount: z.number().int(),
  averageTicket: z.number(),
});
export type SalesInterval = z.infer<typeof SalesIntervalSchema>;

export const ProductSalesSchema = z.object({
  productId: z.string(),
  name: z.string(),
  categoryName: z.string(),
  subcategoryName: z.string(),
  units: z.number().int(),
  revenue: z.number(),
  revenuePercentage: z.number(),
});
export type ProductSales = z.infer<typeof ProductSalesSchema>;

const SubcategorySalesSchema = z.object({
  name: z.string(),
  units: z.number().int(),
  revenue: z.number(),
  revenuePercentage: z.number(),
});

export const CategorySalesSchema = SubcategorySalesSchema.extend({
  subcategories: z.array(SubcategorySalesSchema),
});
export type CategorySales = z.infer<typeof CategorySalesSchema>;

export const ExtraSalesSchema = z.object({
  extraId: z.string(),
  name: z.string(),
  timesSold: z.number().int(),
  revenue: z.number(),
  salesPercentage: z.number(),
});
export type ExtraSales = z.infer<typeof ExtraSalesSchema>;

export const PaymentMethodSalesSchema = z.object({
  method: PaymentMethodSchema,
  salesCount: z.number().int(),
  amount: z.number(),
  percentage: z.number(),
});
export type PaymentMethodSales = z.infer<typeof PaymentMethodSalesSchema>;

export const DayOfWeekSchema = z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  Monday: "Lun",
  Tuesday: "Mar",
  Wednesday: "Mié",
  Thursday: "Jue",
  Friday: "Vie",
  Saturday: "Sáb",
  Sunday: "Dom",
};

export const HeatmapCellSchema = z.object({
  dayOfWeek: DayOfWeekSchema,
  hour: z.number().int().min(0).max(23),
  salesCount: z.number().int(),
  revenue: z.number(),
});
export type HeatmapCell = z.infer<typeof HeatmapCellSchema>;

const PaymentMethodAmountSchema = z.object({
  method: PaymentMethodSchema,
  salesCount: z.number().int(),
  amount: z.number(),
});

export const CashierPerformanceSchema = z.object({
  cashierId: z.string(),
  cashierName: z.string(),
  salesCount: z.number().int(),
  revenue: z.number(),
  averageTicket: z.number(),
  paymentMethods: z.array(PaymentMethodAmountSchema),
  cancelledCount: z.number().int(),
  cancelledAmount: z.number(),
  reductionsCount: z.number().int(),
  reducedAmount: z.number(),
});
export type CashierPerformance = z.infer<typeof CashierPerformanceSchema>;

export const CancellationSchema = z.object({
  saleId: z.string(),
  cancelledAt: z.string(),
  cashierName: z.string(),
  cancelledByName: z.string(),
  previousStatus: z.enum(["Preparing", "Paid"]),
  amount: z.number(),
  reason: z.string(),
});
export type Cancellation = z.infer<typeof CancellationSchema>;

export const MyDaySchema = z.object({
  date: z.string(),
  salesCount: z.number().int(),
  total: z.number(),
  paymentMethods: z.array(PaymentMethodAmountSchema),
  preparingCount: z.number().int(),
  preparingAmount: z.number(),
});
export type MyDay = z.infer<typeof MyDaySchema>;

export const CANCELLATIONS_PAGE_SIZE = 10;
export const RANKING_LIMIT = 10;

export const ReportsQuerySchema = z.object({
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  cancellationsCashier: z.string().trim().min(1).max(450).optional().catch(undefined),
  cancellationsPage: z.coerce.number().int().min(1).optional().catch(undefined),
});
export type ReportsQuery = z.infer<typeof ReportsQuerySchema>;
