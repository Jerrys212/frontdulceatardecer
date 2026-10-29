"use client";

import { useState } from "react";
import { ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ActiveExtra } from "@/data/extras/types";
import { CartPanel } from "@/features/sales/components/cart-panel";
import { useCartHydrated, useCartStore } from "@/features/sales/store/cart-store";
import { formatCurrency } from "@/lib/formats";
import { fromCents } from "@/lib/money";
import { cartTotals } from "@/lib/sales/cart";

export function MobileCartBar({ extras }: { extras: ActiveExtra[] }) {
  const [open, setOpen] = useState(false);
  const hydrated = useCartHydrated();
  const lines = useCartStore((state) => state.lines);
  const units = hydrated ? lines.reduce((sum, line) => sum + line.quantity, 0) : 0;
  const total = hydrated ? fromCents(cartTotals(lines).totalCents) : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="sticky bottom-0 z-20 -mx-4 mt-auto -mb-6 border-t border-border bg-card px-4 py-3 md:-mx-6 md:px-6">
        <SheetTrigger asChild>
          <Button size="lg" className="h-11 w-full justify-between text-base">
            <span className="flex items-center gap-2">
              <ShoppingBagIcon data-icon="inline-start" />
              Ver pedido {units > 0 && `· ${units} ${units === 1 ? "producto" : "productos"}`}
            </span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetTitle className="sr-only">Pedido</SheetTitle>
        <SheetDescription className="sr-only">Productos, extras y total del pedido</SheetDescription>
        <CartPanel extras={extras} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
