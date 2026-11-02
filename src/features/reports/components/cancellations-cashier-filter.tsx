"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUrlFilters } from "@/hooks/use-url-filters";

const ALL = "all";

type Seller = { id: string; fullName: string };

export function CancellationsCashierFilter({ sellers }: { sellers: Seller[] }) {
  const { searchParams, setParams } = useUrlFilters();

  return (
    <Select
      value={searchParams.get("cancellationsCashier") ?? ALL}
      onValueChange={(value) => setParams({ cancellationsCashier: value, cancellationsPage: null })}
    >
      <SelectTrigger className="h-9 w-full bg-card sm:w-56" aria-label="Filtrar cancelaciones por quien registró">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL}>Registró: todos</SelectItem>
          {sellers.map((seller) => (
            <SelectItem key={seller.id} value={seller.id}>
              {seller.fullName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
