"use client";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import type { AvailableProduct } from "@/data/products/types";
import { useCartStore } from "@/features/sales/store/cart-store";
import { formatCurrency } from "@/lib/formats";
import { MAX_LINES } from "@/lib/sales/cart";

type ProductGridProps = {
  products: AvailableProduct[];
  showSubcategory: boolean;
};

export function ProductGrid({ products, showSubcategory }: ProductGridProps) {
  const addProduct = useCartStore((state) => state.addProduct);

  function add(product: AvailableProduct) {
    if (addProduct(product) === "full") {
      toast.error(`El pedido ya tiene ${MAX_LINES} renglones`, {
        description: "Sube la cantidad de un renglón existente o registra este pedido primero.",
      });
    }
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
      {products.map((product) => (
        <li key={product.id}>
          <button
            type="button"
            onClick={() => add(product)}
            aria-label={`Agregar ${product.name}, ${formatCurrency(product.price)}`}
            className="group flex h-full min-h-36 w-full flex-col gap-1 rounded-md border border-border-translucent bg-card p-3 text-left transition-colors outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
          >
            <span className="font-semibold leading-snug">{product.name}</span>
            {showSubcategory && (
              <span className="text-xs text-muted-foreground">
                {product.categoryName} · {product.subcategoryName}
              </span>
            )}
            {product.description && (
              <span className="line-clamp-2 text-xs text-muted-foreground">{product.description}</span>
            )}
            <span className="mt-auto flex items-end justify-between gap-2 pt-2">
              <span className="text-lg font-semibold tabular-nums">{formatCurrency(product.price)}</span>
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-active:scale-95"
              >
                <PlusIcon className="size-5" />
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
