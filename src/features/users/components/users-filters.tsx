"use client";

import { SearchInput } from "@/components/forms/search-input";
import { StatusSelect } from "@/components/forms/status-select";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleSchema } from "@/data/auth/types";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { ROLE_LABELS } from "@/lib/auth/routes";

const ALL = "all";

export function UsersFilters() {
  const { searchParams, isPending, search, setSearch, setParams } = useUrlFilters();

  return (
    <search className="flex flex-col gap-2 sm:flex-row">
      <SearchInput
        value={search}
        label="Buscar por usuario o nombre"
        pending={isPending}
        onChange={setSearch}
        className="h-9 bg-card sm:flex-1"
      />
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Select value={searchParams.get("role") ?? ALL} onValueChange={(value) => setParams({ role: value })}>
          <SelectTrigger className="h-9 w-full bg-card sm:w-44" aria-label="Filtrar por rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>Rol: todos</SelectItem>
              {RoleSchema.options.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <StatusSelect value={searchParams.get("status") ?? ALL} onChange={(status) => setParams({ status })} />
      </div>
    </search>
  );
}
