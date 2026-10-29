"use client";

import { useEffect } from "react";

import { useCartHydrated, useCartStore, type EditSession } from "@/features/sales/store/cart-store";

export function EditSessionLoader({ session }: { session: EditSession }) {
  const hydrated = useCartHydrated();
  const startEdit = useCartStore((state) => state.startEdit);

  useEffect(() => {
    if (!hydrated) return;
    const { mode } = useCartStore.getState();
    if (mode.type === "edit" && mode.saleId === session.saleId) return;
    startEdit(session);
  }, [hydrated, session, startEdit]);

  return null;
}
