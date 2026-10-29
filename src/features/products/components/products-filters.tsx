"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/data/categories/types";

const ALL = "all";
const SEARCH_DEBOUNCE_MS = 300;

export function ProductsFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const categoryId = searchParams.get("category") ?? ALL;
  const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? [];

  function updateParams(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value && value !== ALL) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => updateParams({ search: value.trim() }), SEARCH_DEBOUNCE_MS);
  }

  return (
    <search className="flex flex-col gap-2 lg:flex-row">
      <InputGroup className="h-9 bg-card lg:flex-1">
        <InputGroupAddon>{isPending ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}</InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          maxLength={100}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Buscar producto"
          aria-label="Buscar producto"
        />
      </InputGroup>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
        <Select value={categoryId} onValueChange={(value) => updateParams({ category: value, subcategory: ALL })}>
          <SelectTrigger className="h-9 w-full bg-card lg:w-44" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Categoría: todas</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("subcategory") ?? ALL}
          onValueChange={(value) => updateParams({ subcategory: value })}
          disabled={subcategories.length === 0}
        >
          <SelectTrigger className="h-9 w-full bg-card lg:w-48" aria-label="Filtrar por subcategoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Subcategoría: todas</SelectItem>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchParams.get("status") ?? ALL} onValueChange={(value) => updateParams({ status: value })}>
          <SelectTrigger className="col-span-2 h-9 w-full bg-card sm:col-span-1 lg:w-36" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </search>
  );
}
