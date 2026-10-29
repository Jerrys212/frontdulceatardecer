"use client";

import { useState } from "react";
import Link from "next/link";
import { BanIcon, BanknoteIcon, EllipsisIcon, EyeIcon, PencilIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Role } from "@/data/auth/types";
import type { Sale } from "@/data/sales/types";
import { CancelSaleDialog } from "@/features/sales/components/cancel-sale-dialog";
import { PaySaleDialog } from "@/features/sales/components/pay-sale-dialog";

type SaleActionsProps = {
  sale: Pick<Sale, "id" | "status" | "total" | "customerDescription">;
  role: Role;
  layout: "card" | "detail";
};

function getSalePermissions(status: Sale["status"], role: Role) {
  const canSell = role === "Admin" || role === "Cashier";
  return {
    canPay: canSell && status === "Preparing",
    canEdit: canSell && status === "Preparing",
    canCancel: (canSell && status === "Preparing") || (role === "Admin" && status === "Paid"),
  };
}

export function SaleActions({ sale, role, layout }: SaleActionsProps) {
  const [dialog, setDialog] = useState<"pay" | "cancel" | null>(null);
  const { canPay, canEdit, canCancel } = getSalePermissions(sale.status, role);

  const dialogs = (
    <>
      {dialog === "pay" && <PaySaleDialog sale={sale} onClose={() => setDialog(null)} />}
      {dialog === "cancel" && <CancelSaleDialog sale={sale} onClose={() => setDialog(null)} />}
    </>
  );

  if (layout === "detail") {
    if (!canPay && !canEdit && !canCancel) return null;
    return (
      <div className="flex flex-col gap-2">
        {canPay && (
          <Button size="lg" onClick={() => setDialog("pay")}>
            <BanknoteIcon data-icon="inline-start" />
            Cobrar
          </Button>
        )}
        {canEdit && (
          <Button asChild size="lg" variant="outline">
            <Link href={`/pos?edit=${sale.id}`}>
              <PencilIcon data-icon="inline-start" />
              Modificar
            </Link>
          </Button>
        )}
        {canCancel && (
          <Button size="lg" variant="danger-outline" onClick={() => setDialog("cancel")}>
            <BanIcon data-icon="inline-start" />
            Cancelar venta
          </Button>
        )}
        {dialogs}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {canPay && (
        <Button className="flex-1" onClick={() => setDialog("pay")}>
          <BanknoteIcon data-icon="inline-start" />
          Cobrar
        </Button>
      )}
      {canEdit && (
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/pos?edit=${sale.id}`}>
            <PencilIcon data-icon="inline-start" />
            Modificar
          </Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={cn(!canPay && !canEdit && "ml-auto")} aria-label="Más acciones">
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 shadow-dropdown">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/sales/${sale.id}`}>
                <EyeIcon />
                Ver detalle
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onSelect={() => setDialog("cancel")}>
                  <BanIcon />
                  Cancelar venta
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs}
    </div>
  );
}
