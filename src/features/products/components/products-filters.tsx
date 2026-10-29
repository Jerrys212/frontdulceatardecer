"use client";

import { SearchInput } from "@/components/forms/search-input";
import { StatusSelect } from "@/components/forms/status-select";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/data/categories/types";
import { useUrlFilters } from "@/hooks/use-url-filters";

const ALL = "all";

export function ProductsFilters({ categories }: { categories: Category[] }) {
  const { searchParams, isPending, search, setSearch, setParams } = useUrlFilters();
  const categoryId = searchParams.get("category") ?? ALL;
  const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? [];

  return (
    <search className="flex flex-col gap-2 lg:flex-row">
      <SearchInput
        value={search}
        label="Buscar producto"
        pending={isPending}
        onChange={setSearch}
        className="h-9 bg-card lg:flex-1"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
        <Select value={categoryId} onValueChange={(value) => setParams({ category: value, subcategory: null })}>
          <SelectTrigger className="h-9 w-full bg-card lg:w-44" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>Categoría: todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("subcategory") ?? ALL}
          onValueChange={(value) => setParams({ subcategory: value })}
          disabled={subcategories.length === 0}
        >
          <SelectTrigger className="h-9 w-full bg-card lg:w-48" aria-label="Filtrar por subcategoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>Subcategoría: todas</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <StatusSelect
          value={searchParams.get("status") ?? ALL}
          onChange={(status) => setParams({ status })}
          className="col-span-2 sm:col-span-1 sm:w-full lg:w-36"
        />
      </div>
    </search>
  );
}
