import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-admin";
import { getAllCategories } from "@/data/categories/get-all-categories";
import { getProductsPage } from "@/data/products/get-products-page";
import { ProductsQuerySchema, type ProductsQuery } from "@/data/products/types";
import { CreateProductButton } from "@/features/products/components/create-product-button";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { ProductsTable } from "@/features/products/components/products-table";

export const metadata: Metadata = {
  title: "Productos",
};

type SearchParams = PageProps<"/catalog/products">["searchParams"];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildProductsHref(query: ProductsQuery, page: number) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.subcategory) params.set("subcategory", query.subcategory);
  if (query.status) params.set("status", query.status);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/catalog/products?${queryString}` : "/catalog/products";
}

async function CreateProductAction() {
  await requireAdmin();
  const categories = await getAllCategories();
  return <CreateProductButton categories={categories} />;
}

async function ProductsSection({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const raw = await searchParams;
  const query = ProductsQuerySchema.parse({
    search: firstValue(raw.search),
    category: firstValue(raw.category),
    subcategory: firstValue(raw.subcategory),
    status: firstValue(raw.status),
    page: firstValue(raw.page),
  });
  const [result, categories] = await Promise.all([getProductsPage(query), getAllCategories()]);
  const hasFilters = Boolean(query.search || query.category || query.subcategory || query.status);

  return (
    <>
      <ProductsFilters categories={categories} />
      <section aria-label="Productos" className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {result.items.length > 0 ? (
          <ProductsTable products={result.items} categories={categories} />
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="font-medium">{hasFilters ? "No encontramos productos" : "Aún no hay productos"}</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Prueba con otra búsqueda o quita los filtros."
                : categories.length === 0
                  ? "Primero crea una categoría con sus subcategorías."
                  : "Crea el primero con «Nuevo producto»."}
            </p>
            {hasFilters && (
              <Button asChild variant="outline" size="sm">
                <Link href="/catalog/products">Quitar filtros</Link>
              </Button>
            )}
            {!hasFilters && categories.length === 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/catalog/categories">Ir a Categorías</Link>
              </Button>
            )}
          </div>
        )}
      </section>
      {result.totalCount > 0 && (
        <PaginationBar
          page={result.page}
          pageSize={result.pageSize}
          itemCount={result.items.length}
          totalCount={result.totalCount}
          totalPages={result.totalPages}
          hrefForPage={(page) => buildProductsHref(query, page)}
        />
      )}
    </>
  );
}

function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando productos">
      <Skeleton className="h-9 w-full" />
      <div className="flex flex-col gap-2 rounded-md border border-border-translucent bg-card p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: PageProps<"/catalog/products">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            El punto de venta solo muestra productos activos de categorías y subcategorías activas.
          </p>
        </div>
        <Suspense
          fallback={
            <Button size="lg" disabled>
              <PlusIcon />
              Nuevo producto
            </Button>
          }
        >
          <CreateProductAction />
        </Suspense>
      </header>
      <Suspense fallback={<ProductsSkeleton />}>
        <div className="flex flex-col gap-4">
          <ProductsSection searchParams={searchParams} />
        </div>
      </Suspense>
    </div>
  );
}
