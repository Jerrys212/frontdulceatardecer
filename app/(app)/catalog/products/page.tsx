import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-role";
import { getAllCategories } from "@/data/categories/get-all-categories";
import { getProductsPage } from "@/data/products/get-products-page";
import { ProductsQuerySchema, type ProductsQuery } from "@/data/products/types";
import { CreateProductButton } from "@/features/products/components/product-form-dialog";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { ProductsTable } from "@/features/products/components/products-table";
import { firstValue, withQuery } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Productos",
};

type SearchParams = PageProps<"/catalog/products">["searchParams"];

function buildProductsHref(query: ProductsQuery, page: number) {
  return withQuery("/catalog/products", { ...query, page: page > 1 ? page : undefined });
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
          <EmptyState
            title={hasFilters ? "No encontramos productos" : "Aún no hay productos"}
            description={
              hasFilters
                ? "Prueba con otra búsqueda o quita los filtros."
                : categories.length === 0
                  ? "Primero crea una categoría con sus subcategorías."
                  : "Crea el primero con «Nuevo producto»."
            }
          >
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
          </EmptyState>
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
      <PageHeader
        title="Productos"
        description="El punto de venta solo muestra productos activos de categorías y subcategorías activas."
      >
        <Suspense
          fallback={
            <Button size="lg" disabled>
              <PlusIcon data-icon="inline-start" />
              Nuevo producto
            </Button>
          }
        >
          <CreateProductAction />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<ProductsSkeleton />}>
        <div className="flex flex-col gap-4">
          <ProductsSection searchParams={searchParams} />
        </div>
      </Suspense>
    </div>
  );
}
