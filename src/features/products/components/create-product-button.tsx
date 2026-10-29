"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Category } from "@/data/categories/types";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";

export function CreateProductButton({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <PlusIcon />
        Nuevo producto
      </Button>
      {open && <ProductFormDialog categories={categories} onClose={() => setOpen(false)} />}
    </>
  );
}
