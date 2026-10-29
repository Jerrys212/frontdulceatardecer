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
  categoryId: string | null;
  subcategoryId: string | null;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

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
  }

  function selectSubcategory(id: string) {
    setSearch("");
    navigate({ category: categoryId, subcategory: id, search: null });
  }

  return (
    <nav aria-label="Catálogo" className="flex flex-col gap-3">
      <InputGroup className="h-10 bg-card md:max-w-sm">
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
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Categorías">
        {categories.map((category) => (
          <Chip
            key={category.id}
            active={!searching && category.id === categoryId}
            onClick={() => selectCategory(category.id)}
          >
            {category.name}
          </Chip>
        ))}
      </div>
      {!searching && subcategories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Subcategorías">
          {subcategories.map((subcategory) => (
            <Chip
              key={subcategory.id}
              active={subcategory.id === subcategoryId}
              onClick={() => selectSubcategory(subcategory.id)}
            >
              {subcategory.name}
            </Chip>
          ))}
        </div>
      )}
    </nav>
  );
}
