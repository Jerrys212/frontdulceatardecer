"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { cn } from "cn";

import { setProductActive } from "@/actions/products/product-actions";
import { ActiveSwitch } from "@/components/active-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Category } from "@/data/categories/types";
import type { Product } from "@/data/products/types";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { formatCurrency } from "@/lib/formats";

type ProductsTableProps = {
  products: Product[];
  categories: Category[];
};

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <>
      <Table className="sm:table-fixed">
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="pl-4">Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Categoría / Subcategoría</TableHead>
            <TableHead className="text-center">Precio</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="pr-4">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className={cn(!product.isActive && "text-muted-foreground")}>
              <TableCell className="pl-4 whitespace-normal">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  {product.name}
                  {!product.isActive && (
                    <Badge variant="outline">
                      Inactivo
                    </Badge>
                  )}
                </span>
                {product.description && (
                  <span className="line-clamp-2 text-xs text-muted-foreground" title={product.description}>
                    {product.description}
                  </span>
                )}
                <span className="block text-xs text-muted-foreground sm:hidden">
                  {product.categoryName} / {product.subcategoryName}
                </span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {product.categoryName} / {product.subcategoryName}
              </TableCell>
              <TableCell className="text-center tabular-nums">{formatCurrency(product.price)}</TableCell>
              <TableCell className="text-center">
                <ActiveSwitch
                  checked={product.isActive}
                  label={`${product.isActive ? "Desactivar" : "Activar"} ${product.name}`}
                  deactivateTitle={`¿Desactivar ${product.name}?`}
                  deactivateDescription="Dejará de aparecer en el punto de venta. Las ventas ya registradas no cambian."
                  onToggle={(active) => setProductActive(product.id, active)}
                />
              </TableCell>
              <TableCell className="pr-4 text-center">
                <Button variant="outline" size="sm" aria-label={`Editar ${product.name}`} onClick={() => setEditing(product)}>
                  <PencilIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editing && (
        <ProductFormDialog key={editing.id} product={editing} categories={categories} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
