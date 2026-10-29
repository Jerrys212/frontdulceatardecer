"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEARCH_DEBOUNCE_MS = 300;
const ALL = "all";

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearchValue] = useState(searchParams.get("search") ?? "");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  function replaceParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value && value !== ALL) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  function setParams(changes: Record<string, string | null>) {
    if ("search" in changes) {
      clearTimeout(searchTimeout.current);
      setSearchValue(changes.search ?? "");
    }
    replaceParams(changes);
  }

  function setSearch(value: string) {
    setSearchValue(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => replaceParams({ search: value.trim() || null }), SEARCH_DEBOUNCE_MS);
  }

  return { searchParams, isPending, search, setSearch, setParams };
}
