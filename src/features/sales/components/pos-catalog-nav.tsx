"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { cn } from "cn";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { ActiveCategory } from "@/data/categories/types";

const SEARCH_DEBOUNCE_MS = 300;

type PosCatalogNavProps = {
  categories: ActiveCategory[];
  categoryId: string;
  subcategoryId: string | null;
};

export function PosCatalogNav({ categories, categoryId, subcategoryId }: PosCatalogNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searching = (searchParams.get("search") ?? "") !== "";
  const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? [];

  function navigate(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => navigate({ search: value.trim() || null }), SEARCH_DEBOUNCE_MS);
  }

  function selectCategory(id: string) {
    setSearch("");
    navigate({ category: id, subcategory: null, search: null });
    window.scrollTo({ top: 0 });
  }

  function selectSubcategory(id: string) {
    setSearch("");
    navigate({ category: categoryId, subcategory: id, search: null });
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <InputGroup role="search" className="h-10 bg-card md:max-w-sm">
        <InputGroupAddon>{isPending ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}</InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          maxLength={100}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Buscar producto…"
          aria-label="Buscar producto"
        />
      </InputGroup>
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
                onClick={() => selectCategory(category.id)}
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
                  onClick={() => selectSubcategory(subcategory.id)}
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
