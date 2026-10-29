"use client";

import { useState, useTransition } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { cancelSale } from "@/actions/sales/sale-actions";
import { CancelSaleSchema } from "@/actions/sales/schemas";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { saleNumber, type Sale } from "@/data/sales/types";
import { formatCurrency } from "@/lib/formats";
import { toastFailure } from "@/lib/toast-failure";

type CancelSaleDialogProps = {
  sale: Pick<Sale, "id" | "status" | "total">;
  onClose: () => void;
  onCancelled?: () => void;
};

export function CancelSaleDialog({ sale, onClose, onCancelled }: CancelSaleDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    const parsed = CancelSaleSchema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa el motivo");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await cancelSale(sale.id, { reason });
      if (!result.success) {
        toastFailure(result);
        return;
      }
      toast.success(`${result.message} ${saleNumber(sale.id)}`);
      onClose();
      onCancelled?.();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar venta {saleNumber(sale.id)}</DialogTitle>
          <DialogDescription>
            Total {formatCurrency(sale.total)}. La cancelación es definitiva y queda registrada con su motivo.
          </DialogDescription>
        </DialogHeader>
        {sale.status === "Paid" && (
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertDescription>
              Esta venta ya se cobró. Al cancelarla deja de contar en los ingresos; recuerda devolver el dinero si aplica.
            </AlertDescription>
          </Alert>
        )}
        <Field data-invalid={error !== null}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="cancel-reason">Motivo</FieldLabel>
            <span className="text-xs text-muted-foreground tabular-nums">{reason.length}/200</span>
          </div>
          <Textarea
            id="cancel-reason"
            value={reason}
            rows={3}
            maxLength={200}
            autoFocus
            placeholder="Ej. El cliente se retiró antes de recibir su pedido"
            aria-invalid={error !== null}
            onChange={(event) => setReason(event.target.value)}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Volver
            </Button>
          </DialogClose>
          <Button variant="danger" onClick={confirm} disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? "Cancelando…" : "Cancelar venta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
