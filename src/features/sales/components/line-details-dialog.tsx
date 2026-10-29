"use client";

import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { QuantityStepper } from "@/components/quantity-stepper";
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
import { Textarea } from "@/components/ui/textarea";
import type { ActiveExtra } from "@/data/extras/types";
import { useCartStore } from "@/features/sales/store/cart-store";
import { formatCurrency } from "@/lib/formats";
import { fromCents, toCents } from "@/lib/money";
import { MAX_EXTRA_QUANTITY, MAX_NOTE_LENGTH, lineUnitCents, type CartExtra, type CartLine } from "@/lib/sales/cart";

type LineDetailsDialogProps = {
  line: CartLine;
  extras: ActiveExtra[];
  onClose: () => void;
};

export function LineDetailsDialog({ line, extras, onClose }: LineDetailsDialogProps) {
  const updateLineDetails = useCartStore((state) => state.updateLineDetails);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(line.extras.map((extra) => [extra.extraId, extra.quantity])),
  );
  const [note, setNote] = useState(line.note);

  const knownIds = new Set(extras.map((extra) => extra.id));
  const options: CartExtra[] = [
    ...extras.map((extra) => ({
      extraId: extra.id,
      name: extra.name,
      priceCents: toCents(extra.price),
      quantity: quantities[extra.id] ?? 0,
    })),
    ...line.extras
      .filter((extra) => !knownIds.has(extra.extraId))
      .map((extra) => ({ ...extra, quantity: quantities[extra.extraId] ?? 0 })),
  ];
  const selected = options.filter((option) => option.quantity > 0);
  const unitCents = lineUnitCents({ priceCents: line.priceCents, extras: selected });

  function apply() {
    updateLineDetails(line.key, { extras: selected, note: note.slice(0, MAX_NOTE_LENGTH) });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extras y nota</DialogTitle>
          <DialogDescription>
            {line.productName} · {line.quantity} {line.quantity === 1 ? "unidad" : "unidades"}. Aplican a todas las
            unidades del renglón.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-6 flex flex-1 flex-col gap-4 overflow-y-auto px-6">
          {options.length === 0 ? (
            <EmptyState description="No hay extras disponibles." className="rounded-md bg-muted p-4" />
          ) : (
            <ul className="flex flex-col gap-2">
              {options.map((option) => (
                <li key={option.extraId} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{option.name}</span>
                    <span className={option.priceCents === 0 ? "text-xs text-success" : "text-xs text-muted-foreground"}>
                      {option.priceCents === 0 ? "Gratis" : `+${formatCurrency(fromCents(option.priceCents))}`}
                    </span>
                  </span>
                  <QuantityStepper
                    value={option.quantity}
                    min={0}
                    max={MAX_EXTRA_QUANTITY}
                    label={option.name}
                    onChange={(value) => setQuantities((current) => ({ ...current, [option.extraId]: value }))}
                  />
                </li>
              ))}
            </ul>
          )}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="line-note">Nota para cocina</FieldLabel>
              <span className="text-xs text-muted-foreground tabular-nums">
                {note.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <Textarea
              id="line-note"
              value={note}
              maxLength={MAX_NOTE_LENGTH}
              rows={2}
              placeholder="Ej. Bien dorados, sin crema"
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2.5 text-sm">
          <span className="text-muted-foreground">Precio unitario resultante</span>
          <span className="text-base font-semibold tabular-nums">{formatCurrency(fromCents(unitCents))}</span>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={apply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
