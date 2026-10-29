"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AvailableProduct } from "@/data/products/types";
import { toCents } from "@/lib/money";
import {
  MAX_LINE_QUANTITY,
  MAX_LINES,
  applyCatalogPrices,
  isPlainLine,
  type CartExtra,
  type CartLine,
  type CatalogPrices,
} from "@/lib/sales/cart";

export type CartMode = { type: "new"; idempotencyKey: string } | { type: "edit"; saleId: string; saleNumber: string };

export type EditSession = {
  saleId: string;
  saleNumber: string;
  customerDescription: string;
  lines: CartLine[];
};

type CartState = {
  mode: CartMode;
  customerDescription: string;
  lines: CartLine[];
  addProduct: (product: AvailableProduct) => "added" | "full";
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  updateLineDetails: (key: string, details: { extras: CartExtra[]; note: string }) => void;
  splitLine: (key: string) => string | null;
  setCustomerDescription: (value: string) => void;
  applyCatalog: (catalog: CatalogPrices) => void;
  startEdit: (session: EditSession) => void;
  reset: () => void;
};

const newMode = (): CartMode => ({ type: "new", idempotencyKey: crypto.randomUUID() });

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      mode: { type: "new", idempotencyKey: "" },
      customerDescription: "",
      lines: [],

      addProduct: (product) => {
        const { lines } = get();
        const existing = lines.find((line) => line.productId === product.id && isPlainLine(line));
        if (existing && existing.quantity < MAX_LINE_QUANTITY) {
          set({ lines: lines.map((line) => (line === existing ? { ...line, quantity: line.quantity + 1 } : line)) });
          return "added";
        }
        if (lines.length >= MAX_LINES) return "full";
        const line: CartLine = {
          key: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          categoryName: product.categoryName,
          subcategoryName: product.subcategoryName,
          priceCents: toCents(product.price),
          quantity: 1,
          note: "",
          extras: [],
          notice: null,
          unavailable: false,
        };
        set({ lines: [...lines, line] });
        return "added";
      },

      setQuantity: (key, quantity) =>
        set({
          lines: get().lines.map((line) =>
            line.key === key ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, Math.max(1, quantity)) } : line,
          ),
        }),

      removeLine: (key) => set({ lines: get().lines.filter((line) => line.key !== key) }),

      updateLineDetails: (key, { extras, note }) =>
        set({
          lines: get().lines.map((line) =>
            line.key === key ? { ...line, extras: extras.filter((extra) => extra.quantity > 0), note } : line,
          ),
        }),

      splitLine: (key) => {
        const { lines } = get();
        const index = lines.findIndex((line) => line.key === key);
        const line = lines[index];
        if (!line || line.quantity < 2 || lines.length >= MAX_LINES) return null;
        const copy: CartLine = { ...line, key: crypto.randomUUID(), quantity: 1, notice: null };
        const next = [...lines];
        next.splice(index, 1, { ...line, quantity: line.quantity - 1 }, copy);
        set({ lines: next });
        return copy.key;
      },

      setCustomerDescription: (value) => set({ customerDescription: value }),

      applyCatalog: (catalog) => set({ lines: applyCatalogPrices(get().lines, catalog) }),

      startEdit: ({ saleId, saleNumber, customerDescription, lines }) =>
        set({ mode: { type: "edit", saleId, saleNumber }, customerDescription, lines }),

      reset: () => set({ mode: newMode(), customerDescription: "", lines: [] }),
    }),
    {
      name: "da-pos-cart",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state && state.mode.type === "new" && !state.mode.idempotencyKey) state.reset();
      },
    },
  ),
);

const subscribeToHydration = (onChange: () => void) => useCartStore.persist.onFinishHydration(onChange);

export function useCartHydrated() {
  useEffect(() => {
    if (!useCartStore.persist.hasHydrated()) void useCartStore.persist.rehydrate();
  }, []);
  return useSyncExternalStore(subscribeToHydration, () => useCartStore.persist.hasHydrated(), () => false);
}
