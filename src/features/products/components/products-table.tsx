"use client";

import { Fragment, useState } from "react";
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

type ProductGroup = {
  key: string;
  title: string;
  products: Product[];
};

function groupBySubcategory(products: Product[]): ProductGroup[] {
  const groups: ProductGroup[] = [];
  for (const product of products) {
    const key = `${product.categoryId}:${product.subcategoryId}`;
    const current = groups.at(-1);
    if (current?.key === key) current.products.push(product);
    else groups.push({ key, title: `${product.categoryName} - ${product.subcategoryName}`, products: [product] });
  }
  return groups;
}

type ProductsTableProps = {
  products: Product[];
  categories: Category[];
};

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="pl-4">Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Categoría / Subcategoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="w-20">Estado</TableHead>
            <TableHead className="w-24 pr-4">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupBySubcategory(products).map((group) => (
            <Fragment key={group.key}>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead
                  colSpan={5}
                  scope="colgroup"
                  className="h-8 pl-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {group.title}
                </TableHead>
              </TableRow>
              {group.products.map((product) => (
                <TableRow key={product.id} className={cn(!product.isActive && "text-muted-foreground")}>
                  <TableCell className="max-w-0 pl-4 whitespace-normal">
                    <span className="flex flex-wrap items-center gap-2 font-medium">
                      {product.name}
                      {!product.isActive && (
                        <Badge variant="outline" className="rounded-sm">
                          Inactivo
                        </Badge>
                      )}
                    </span>
                    {product.description && (
                      <span className="block truncate text-xs text-muted-foreground" title={product.description}>
                        {product.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {product.categoryName} / {product.subcategoryName}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <ActiveSwitch
                      checked={product.isActive}
                      label={`${product.isActive ? "Desactivar" : "Activar"} ${product.name}`}
                      deactivateTitle={`¿Desactivar ${product.name}?`}
                      deactivateDescription="Dejará de aparecer en el punto de venta. Las ventas ya registradas no cambian."
                      onToggle={(active) => setProductActive(product.id, active)}
                    />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Editar ${product.name}`}
                      onClick={() => setEditing(product)}
                    >
                      <PencilIcon />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      {editing && (
        <ProductFormDialog key={editing.id} product={editing} categories={categories} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
