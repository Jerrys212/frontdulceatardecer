"use client";

import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/formats";

type PricesChangedDialogProps = {
  previousTotal: number;
  newTotal: number;
  confirmLabel: string;
  isSubmitting: boolean;
  onReview: () => void;
  onConfirm: () => void;
};

export function PricesChangedDialog({
  previousTotal,
  newTotal,
  confirmLabel,
  isSubmitting,
  onReview,
  onConfirm,
}: PricesChangedDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && !isSubmitting && onReview()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-warning/15 text-warning">
            <TriangleAlertIcon className="size-5" />
          </span>
          <AlertDialogTitle>Los precios cambiaron, revisa el pedido</AlertDialogTitle>
          <AlertDialogDescription>
            Los renglones afectados están marcados con «Precio actualizado». Confirma el total nuevo con el cliente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-center gap-4 rounded-md border border-border bg-muted/50 px-4 py-3">
          <span className="flex flex-col items-center text-xs text-muted-foreground">
            Total
            <span className="text-lg text-muted-foreground line-through tabular-nums">
              {formatCurrency(previousTotal)}
            </span>
          </span>
          <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="flex flex-col items-center text-xs text-muted-foreground">
            Total nuevo
            <span className="text-2xl font-semibold text-primary tabular-nums">{formatCurrency(newTotal)}</span>
          </span>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" disabled={isSubmitting} onClick={onReview}>
            Revisar pedido
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
