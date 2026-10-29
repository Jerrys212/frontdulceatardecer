"use client";

import { useState, useTransition } from "react";
import { ArrowLeftRightIcon, BanknoteIcon, CreditCardIcon, type LucideIcon } from "lucide-react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PAYMENT_METHOD_LABELS, PaymentMethodSchema, saleNumber, type PaymentMethod, type Sale } from "@/data/sales/types";
import { formatCurrency } from "@/lib/formats";
import { MONEY_PATTERN, fromCents, toCents } from "@/lib/money";
import { toastFailure } from "@/lib/toast-failure";

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
  const receivedValid = MONEY_PATTERN.test(received.trim());
  const receivedCents = receivedValid ? toCents(Number(received)) : 0;
  const changeCents = receivedCents - totalCents;
  const quickBills = BILLS.filter((bill) => bill * 100 > totalCents).slice(0, 3);
  const canConfirm = method !== "Cash" || received.trim() === "" || (receivedValid && changeCents >= 0);

  function confirm() {
    startTransition(async () => {
      const result = await paySale(sale.id, method);
      if (!result.success) {
        toastFailure(result);
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

        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Método de pago"
          className="grid w-full grid-cols-3"
          value={method}
          onValueChange={(value) => {
            const parsed = PaymentMethodSchema.safeParse(value);
            if (parsed.success) setMethod(parsed.data);
          }}
        >
          {METHODS.map(({ value, Icon }) => (
            <ToggleGroupItem key={value} value={value} className="h-auto flex-col gap-1.5 py-3">
              <Icon />
              {PAYMENT_METHOD_LABELS[value]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {method === "Cash" && (
          <Field>
            <FieldLabel htmlFor="cash-received">
              Monto recibido <span className="font-normal text-muted-foreground">(opcional, para calcular el cambio)</span>
            </FieldLabel>
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
          </Field>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={confirm} disabled={isPending || !canConfirm}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? "Cobrando…" : "Confirmar cobro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
