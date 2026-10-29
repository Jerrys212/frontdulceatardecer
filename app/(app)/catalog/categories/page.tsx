import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-role";
import { getAllCategories } from "@/data/categories/get-all-categories";
import { CategoriesList } from "@/features/categories/components/categories-list";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";

export const metadata: Metadata = {
  title: "Categorías",
};

async function CategoriesSection() {
  await requireAdmin();
  const categories = await getAllCategories();
  return <CategoriesList categories={categories} />;
}

function CategoriesSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando categorías">
      <Skeleton className="h-9 w-full" />
      <div className="flex flex-col gap-2 rounded-md border border-border-translucent bg-card p-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Categorías"
        description="Organizan los productos del punto de venta. No se borran: se activan o desactivan."
      >
        <CreateCategoryDialog />
      </PageHeader>
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>
    </div>
  );
}
