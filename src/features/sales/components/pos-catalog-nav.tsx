"use client";

import { cn } from "cn";

import { SearchInput } from "@/components/forms/search-input";
import type { ActiveCategory } from "@/data/categories/types";
import { useUrlFilters } from "@/hooks/use-url-filters";

type PosCatalogNavProps = {
  categories: ActiveCategory[];
  categoryId: string;
  subcategoryId: string | null;
};

export function PosCatalogNav({ categories, categoryId, subcategoryId }: PosCatalogNavProps) {
  const { searchParams, isPending, search, setSearch, setParams } = useUrlFilters();
  const searching = (searchParams.get("search") ?? "") !== "";
  const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? [];

  function selectCatalog(changes: { category: string; subcategory: string | null }) {
    setParams({ ...changes, search: null });
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <search className="md:max-w-sm">
        <SearchInput
          value={search}
          label="Buscar producto"
          pending={isPending}
          onChange={setSearch}
          className="h-10 bg-card"
        />
      </search>
      <nav
        aria-label="Catálogo"
        className="sticky top-16 z-20 -mx-4 -mt-2 flex flex-col gap-2 bg-background px-4 pb-2 md:-mx-6 md:px-6"
      >
        <div className="flex gap-1 overflow-x-auto border-b border-border" role="group" aria-label="Categorías">
          {categories.map((category) => {
            const active = !searching && category.id === categoryId;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectCatalog({ category: category.id, subcategory: null })}
                className={cn(
                  "-mb-px h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
        {!searching && subcategories.length > 1 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5" role="group" aria-label="Subcategorías">
            {subcategories.map((subcategory) => {
              const active = subcategory.id === subcategoryId;
              return (
                <button
                  key={subcategory.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectCatalog({ category: categoryId, subcategory: subcategory.id })}
                  className={cn(
                    "h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {subcategory.name}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
