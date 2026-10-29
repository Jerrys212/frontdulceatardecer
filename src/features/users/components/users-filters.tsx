"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleSchema } from "@/data/auth/types";
import { ROLE_LABELS } from "@/lib/auth/routes";

const ALL = "all";
const SEARCH_DEBOUNCE_MS = 300;

export function UsersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value && value !== ALL) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => updateParam("search", value.trim()), SEARCH_DEBOUNCE_MS);
  }

  return (
    <search className="flex flex-col gap-2 sm:flex-row">
      <InputGroup className="h-9 bg-card sm:flex-1">
        <InputGroupAddon>
          {isPending ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          maxLength={100}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Buscar por usuario o nombre"
          aria-label="Buscar por usuario o nombre"
        />
      </InputGroup>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Select value={searchParams.get("role") ?? ALL} onValueChange={(value) => updateParam("role", value)}>
          <SelectTrigger className="h-9 w-full bg-card sm:w-44" aria-label="Filtrar por rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Rol: todos</SelectItem>
            {RoleSchema.options.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchParams.get("status") ?? ALL} onValueChange={(value) => updateParam("status", value)}>
          <SelectTrigger className="h-9 w-full bg-card sm:w-40" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Estado: todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </search>
  );
}
