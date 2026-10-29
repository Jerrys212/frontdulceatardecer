"use client";

import { useState, useTransition } from "react";
import { ArrowLeftRightIcon, BanknoteIcon, CreditCardIcon, Loader2Icon, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { paySale } from "@/actions/sales/sale-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { PAYMENT_METHOD_LABELS, saleNumber, type PaymentMethod, type Sale } from "@/data/sales/types";
import { formatCurrency } from "@/lib/formats";
import { fromCents, toCents } from "@/lib/money";

const METHODS: { value: PaymentMethod; Icon: LucideIcon }[] = [
  { value: "Cash", Icon: BanknoteIcon },
  { value: "Card", Icon: CreditCardIcon },
  { value: "Transfer", Icon: ArrowLeftRightIcon },
];

const BILLS = [50, 100, 200, 500, 1000];

type PaySaleDialogProps = {
  sale: Pick<Sale, "id" | "total" | "customerDescription">;
  onClose: () => void;
};

export function PaySaleDialog({ sale, onClose }: PaySaleDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [received, setReceived] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalCents = toCents(sale.total);
  const receivedValid = /^\d+(\.\d{1,2})?$/.test(received.trim());
  const receivedCents = receivedValid ? toCents(Number(received)) : 0;
  const changeCents = receivedCents - totalCents;
  const quickBills = BILLS.filter((bill) => bill * 100 > totalCents).slice(0, 3);
  const canConfirm = method !== "Cash" || received.trim() === "" || (receivedValid && changeCents >= 0);

  function confirm() {
    startTransition(async () => {
      const result = await paySale(sale.id, method);
      if (!result.success) {
        toast.error(result.message, { description: result.errors.filter((error) => error !== result.message).join(" ") });
        return;
      }
      toast.success(`${result.message} ${saleNumber(sale.id)}`, {
        description:
          method === "Cash" && receivedValid && changeCents > 0
            ? `Cambio: ${formatCurrency(fromCents(changeCents))}`
            : PAYMENT_METHOD_LABELS[method],
      });
      onClose();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cobrar venta {saleNumber(sale.id)}</DialogTitle>
          <DialogDescription>
            Total a cobrar{sale.customerDescription ? ` · ${sale.customerDescription}` : ""}
          </DialogDescription>
        </DialogHeader>
        <p className="text-center text-4xl font-semibold tabular-nums">{formatCurrency(sale.total)}</p>

        <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-3 gap-2">
          {METHODS.map(({ value, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={method === value}
              onClick={() => setMethod(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                method === value
                  ? "border-success bg-success/10 text-success"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {PAYMENT_METHOD_LABELS[value]}
            </button>
          ))}
        </div>

        {method === "Cash" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="cash-received" className="text-sm font-medium">
              Monto recibido <span className="font-normal text-muted-foreground">(opcional, para calcular el cambio)</span>
            </label>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="cash-received"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={received}
                aria-invalid={received.trim() !== "" && (!receivedValid || changeCents < 0)}
                onChange={(event) => setReceived(event.target.value)}
              />
            </InputGroup>
            <div className="grid grid-cols-4 gap-2">
              {quickBills.map((bill) => (
                <Button key={bill} type="button" variant="outline" onClick={() => setReceived(String(bill))}>
                  {formatCurrency(bill)}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className={cn(quickBills.length < 3 && "col-span-2")}
                onClick={() => setReceived(fromCents(totalCents).toFixed(2))}
              >
                Exacto
              </Button>
            </div>
            {received.trim() !== "" && (
              <div
                aria-live="polite"
                className={cn(
                  "flex items-center justify-between rounded-md px-4 py-3",
                  receivedValid && changeCents >= 0 ? "bg-success/10" : "bg-danger/10",
                )}
              >
                <span className="text-sm font-medium">
                  {!receivedValid ? "Monto no válido" : changeCents >= 0 ? "Cambio" : "Faltan"}
                </span>
                {receivedValid && (
                  <span
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
                      changeCents >= 0 ? "text-success" : "text-danger",
                    )}
                  >
                    {formatCurrency(fromCents(Math.abs(changeCents)))}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button disabled={!canConfirm || isPending} onClick={confirm}>
            {isPending && <Loader2Icon className="animate-spin" />}
            {isPending ? "Cobrando…" : "Confirmar cobro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
