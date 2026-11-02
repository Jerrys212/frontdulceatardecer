"use client";

import { DatePicker } from "@/components/forms/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethodSchema,
  SALE_STATUS_LABELS,
  SaleStatusSchema,
} from "@/data/sales/types";
import { useUrlFilters } from "@/hooks/use-url-filters";

const ALL = "all";

type Seller = { id: string; fullName: string };

export function SalesFilters({ today, sellers }: { today: string; sellers: Seller[] }) {
  const { searchParams, isPending, setParams } = useUrlFilters();
  const from = searchParams.get("from") ?? today;
  const to = searchParams.get("to") ?? today;

  return (
    <search className="flex flex-col gap-3 lg:flex-row lg:items-end" aria-busy={isPending}>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-from" className="text-xs text-muted-foreground">
            Desde
          </Label>
          <DatePicker
            id="sales-from"
            value={from}
            max={to}
            onChange={(date) => setParams({ from: date })}
            className="bg-card"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sales-to" className="text-xs text-muted-foreground">
            Hasta
          </Label>
          <DatePicker
            id="sales-to"
            value={to}
            min={from}
            max={today}
            onChange={(date) => setParams({ to: date })}
            className="bg-card"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
        <Select value={searchParams.get("status") ?? ALL} onValueChange={(status) => setParams({ status })}>
          <SelectTrigger className="h-9 w-full bg-card lg:w-44" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>Estado: todos</SelectItem>
              {SaleStatusSchema.options.map((status) => (
                <SelectItem key={status} value={status}>
                  {SALE_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("paymentMethod") ?? ALL}
          onValueChange={(paymentMethod) => setParams({ paymentMethod })}
        >
          <SelectTrigger className="h-9 w-full bg-card lg:w-44" aria-label="Filtrar por método de pago">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>Pago: todos</SelectItem>
              {PaymentMethodSchema.options.map((method) => (
                <SelectItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={searchParams.get("cashierId") ?? ALL} onValueChange={(cashierId) => setParams({ cashierId })}>
          <SelectTrigger className="col-span-2 h-9 w-full bg-card sm:col-span-1 lg:w-48" aria-label="Filtrar por quien registró">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>Registró: todos</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.fullName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </search>
  );
}
