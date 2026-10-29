"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlertIcon,
  ShoppingBagIcon,
  SlidersHorizontalIcon,
  SplitIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { getCatalogPrices, registerSale, updateSale, type SaleSubmitResult } from "@/actions/sales/sale-actions";
import { EmptyState } from "@/components/empty-state";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { ActiveExtra } from "@/data/extras/types";
import { LineDetailsDialog } from "@/features/sales/components/line-details-dialog";
import { PricesChangedDialog } from "@/features/sales/components/prices-changed-dialog";
import { SaleNote } from "@/features/sales/components/sale-note";
import { useCartHydrated, useCartStore } from "@/features/sales/store/cart-store";
import { formatCurrency } from "@/lib/formats";
import { fromCents } from "@/lib/money";
import {
  MAX_CUSTOMER_LENGTH,
  MAX_LINE_QUANTITY,
  cartTotals,
  lineAmountCents,
  lineUnitCents,
  toSaleItems,
  type CartLine,
} from "@/lib/sales/cart";
import { toastFailure } from "@/lib/toast-failure";

const UNAVAILABLE_HINT = "no está disponible";
const CONCURRENT_EDIT_HINT = "modificada por otro usuario";
const NOT_EDITABLE_HINT = "Solo se pueden modificar ventas en preparación";

type PriceChange = { previousTotal: number };

function CartLineItem({
  line,
  onEdit,
  onSplit,
}: {
  line: CartLine;
  onEdit: () => void;
  onSplit: () => void;
}) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);

  return (
    <li className={cn("flex flex-col gap-2 border-b border-border px-4 py-3", line.unavailable && "bg-danger/5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className={cn("font-medium", line.unavailable && "text-muted-foreground line-through")}>
            {line.productName}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(fromCents(lineUnitCents(line)))} c/u
          </span>
        </div>
        <span className="font-semibold tabular-nums">{formatCurrency(fromCents(lineAmountCents(line)))}</span>
      </div>
      {line.extras.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label="Extras">
          {line.extras.map((extra) => (
            <li key={extra.extraId}>
              <Badge variant="secondary">
                + {extra.name} ×{extra.quantity}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {line.note.trim() !== "" && (
        <SaleNote note={line.note} />
      )}
      {line.notice && (
        <p className={cn("text-xs font-medium", line.unavailable ? "text-danger" : "text-info")}>{line.notice}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <QuantityStepper
          value={line.quantity}
          min={1}
          max={MAX_LINE_QUANTITY}
          label={`Cantidad de ${line.productName}`}
          onChange={(value) => setQuantity(line.key, value)}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={`Extras y nota de ${line.productName}`}
            disabled={line.unavailable}
            onClick={onEdit}
          >
            <SlidersHorizontalIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={`Separar una unidad de ${line.productName}`}
            disabled={line.quantity < 2 || line.unavailable}
            onClick={onSplit}
          >
            <SplitIcon />
          </Button>
          <Button
            variant="danger-ghost"
            size="icon"
            aria-label={`Quitar ${line.productName}`}
            onClick={() => removeLine(line.key)}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
    </li>
  );
}

type CartPanelProps = {
  extras: ActiveExtra[];
  onClose?: () => void;
};

export function CartPanel({ extras, onClose }: CartPanelProps) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const mode = useCartStore((state) => state.mode);
  const lines = useCartStore((state) => state.lines);
  const customerDescription = useCartStore((state) => state.customerDescription);
  const setCustomerDescription = useCartStore((state) => state.setCustomerDescription);
  const splitLine = useCartStore((state) => state.splitLine);
  const applyCatalog = useCartStore((state) => state.applyCatalog);
  const reset = useCartStore((state) => state.reset);

  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<PriceChange | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Cargando pedido">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const totals = cartTotals(lines);
  const total = fromCents(totals.totalCents);
  const hasUnavailable = lines.some((line) => line.unavailable);
  const isEditing = mode.type === "edit";
  const detailsLine = lines.find((line) => line.key === detailsKey) ?? null;
  const actionLabel = isEditing ? "Guardar cambios" : "Registrar venta";

  async function refreshPrices() {
    const catalog = await getCatalogPrices();
    if (catalog.success) applyCatalog(catalog.data);
    else toast.error(catalog.message, { description: "No pudimos revisar los precios actuales." });
  }

  async function handleFailure(result: Exclude<SaleSubmitResult, { success: true }>, previousTotal: number) {
    if (result.reason === "prices-changed") {
      await refreshPrices();
      setPriceChange({ previousTotal });
      return;
    }

    const mentions = (text: string) => [result.message, ...result.errors].some((message) => message.includes(text));

    if (mentions(UNAVAILABLE_HINT)) {
      await refreshPrices();
      toastFailure(result, "Quita los productos marcados y vuelve a intentar.");
      return;
    }
    if (mode.type === "edit" && (mentions(CONCURRENT_EDIT_HINT) || mentions(NOT_EDITABLE_HINT))) {
      const { saleId } = mode;
      toastFailure(result);
      reset();
      router.replace(mentions(NOT_EDITABLE_HINT) ? `/sales/${saleId}` : `/pos?edit=${saleId}`);
      return;
    }
    toastFailure(result);
  }

  async function submit() {
    const state = useCartStore.getState();
    const expectedTotal = fromCents(cartTotals(state.lines).totalCents);
    const payload = {
      customerDescription: state.customerDescription,
      expectedTotal,
      items: toSaleItems(state.lines),
    };

    setSubmitting(true);
    try {
      const result =
        state.mode.type === "new"
          ? await registerSale(payload, state.mode.idempotencyKey)
          : await updateSale(state.mode.saleId, payload);

      if (!result.success) {
        await handleFailure(result, expectedTotal);
        return;
      }

      setPriceChange(null);
      toast.success(`${result.message} ${result.data.number}`, { description: formatCurrency(expectedTotal) });
      const wasEditing = state.mode.type === "edit";
      reset();
      onClose?.();
      if (wasEditing) router.push("/sales/pending");
    } finally {
      setSubmitting(false);
    }
  }

  function split(key: string) {
    const newKey = splitLine(key);
    if (newKey) setDetailsKey(newKey);
    else toast.error("No se pudo separar el renglón", { description: "El pedido ya tiene el máximo de renglones." });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h2 className="font-semibold">{isEditing ? `Modificando venta ${mode.saleNumber}` : "Pedido nuevo"}</h2>
        {isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground"
            onClick={() => {
              reset();
              router.push("/sales/pending");
            }}
          >
            <XIcon data-icon="inline-start" />
            Salir sin guardar
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" disabled={lines.length === 0} onClick={reset}>
            <Trash2Icon data-icon="inline-start" />
            Vaciar
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Cerrar pedido" onClick={onClose}>
            <XIcon />
          </Button>
        )}
      </header>

      <Field className="gap-1.5 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="customer-description">
            Descripción del cliente <span className="font-normal text-muted-foreground">(opcional)</span>
          </FieldLabel>
          <span className="text-xs text-muted-foreground tabular-nums">
            {customerDescription.length}/{MAX_CUSTOMER_LENGTH}
          </span>
        </div>
        <Input
          id="customer-description"
          className="h-9"
          value={customerDescription}
          maxLength={MAX_CUSTOMER_LENGTH}
          placeholder="Ej. Señora de blusa roja"
          autoComplete="off"
          onChange={(event) => setCustomerDescription(event.target.value)}
        />
      </Field>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {lines.length === 0 ? (
          <EmptyState icon={ShoppingBagIcon} description="Toca un producto para agregarlo al pedido." />
        ) : (
          <>
            <ul aria-label="Productos del pedido">
              {lines.map((line) => (
                <CartLineItem
                  key={line.key}
                  line={line}
                  onEdit={() => setDetailsKey(line.key)}
                  onSplit={() => split(line.key)}
                />
              ))}
            </ul>
            <p className="px-4 py-2 text-xs text-muted-foreground">
              Los extras y la nota aplican a todas las unidades del renglón. Usa separar para una unidad distinta.
            </p>
          </>
        )}
      </div>

      <footer className="flex flex-col gap-3 border-t border-border px-4 py-3">
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-right tabular-nums">{formatCurrency(fromCents(totals.subtotalCents))}</dd>
          <dt className="text-muted-foreground">IVA (16 %)</dt>
          <dd className="text-right tabular-nums">{formatCurrency(fromCents(totals.taxCents))}</dd>
          <dt className="self-end font-semibold">Total</dt>
          <dd className="text-right text-2xl font-semibold tabular-nums">{formatCurrency(total)}</dd>
        </dl>
        <p className="text-xs text-muted-foreground">Precios con IVA incluido.</p>
        {hasUnavailable && (
          <p className="flex items-start gap-1.5 text-xs font-medium text-danger">
            <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Quita los productos que ya no están disponibles para continuar.
          </p>
        )}
        <Button
          size="lg"
          className="h-11 w-full text-base"
          onClick={submit}
          disabled={isSubmitting || lines.length === 0 || hasUnavailable}
        >
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {actionLabel} · {formatCurrency(total)}
        </Button>
      </footer>

      {detailsLine && (
        <LineDetailsDialog key={detailsLine.key} line={detailsLine} extras={extras} onClose={() => setDetailsKey(null)} />
      )}
      {priceChange && (
        <PricesChangedDialog
          previousTotal={priceChange.previousTotal}
          newTotal={total}
          confirmLabel={isEditing ? "Confirmar y guardar" : "Confirmar y registrar"}
          isSubmitting={isSubmitting}
          onReview={() => setPriceChange(null)}
          onConfirm={submit}
        />
      )}
    </div>
  );
}
