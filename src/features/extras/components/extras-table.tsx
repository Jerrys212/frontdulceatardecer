"use client";

import { useMemo, useState } from "react";
import { PencilIcon } from "lucide-react";
import { cn } from "cn";

import { setExtraActive } from "@/actions/extras/extra-actions";
import { ActiveSwitch } from "@/components/active-switch";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/forms/search-input";
import { StatusSelect } from "@/components/forms/status-select";
import { PaginationBar } from "@/components/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Extra } from "@/data/extras/types";
import { ExtraFormDialog } from "@/features/extras/components/extra-form-dialog";
import { formatCurrency } from "@/lib/formats";
import { paginate } from "@/lib/pagination";
import { normalizeSearchText } from "@/lib/utils";
import { matchesStatus, type StatusFilter } from "@/lib/validations/status";

export function ExtrasTable({ extras }: { extras: Extra[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Extra | null>(null);

  const term = normalizeSearchText(search.trim());
  const visible = useMemo(
    () =>
      extras.filter(
        (extra) =>
          matchesStatus(extra.isActive, status) &&
          (term === "" || normalizeSearchText(extra.name).includes(term)),
      ),
    [extras, status, term],
  );
  const current = paginate(visible, page);

  return (
    <>
      <search className="flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={search}
          label="Buscar extra"
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="h-9 bg-card sm:flex-1"
        />
        <StatusSelect
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </search>

      <section aria-label="Extras" className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {visible.length === 0 ? (
          <EmptyState
            title={extras.length === 0 ? "Aún no hay extras" : "No encontramos extras"}
            description={
              extras.length === 0
                ? "Crea el primero con «Nuevo extra»."
                : "Prueba con otra búsqueda o cambia el filtro de estado."
            }
          />
        ) : (
          <Table className="sm:table-fixed">
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="pl-4">Nombre</TableHead>
                <TableHead className="text-center">Precio</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.items.map((extra) => (
                <TableRow key={extra.id} className={cn(!extra.isActive && "text-muted-foreground")}>
                  <TableCell className="pl-4 font-medium">
                    <span className="flex flex-wrap items-center gap-2">
                      {extra.name}
                      {!extra.isActive && (
                        <Badge variant="outline">
                          Inactivo
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {extra.price === 0 ? (
                      <Badge variant="success-subtle">Gratis</Badge>
                    ) : (
                      formatCurrency(extra.price)
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <ActiveSwitch
                      checked={extra.isActive}
                      label={`${extra.isActive ? "Desactivar" : "Activar"} ${extra.name}`}
                      deactivateTitle={`¿Desactivar ${extra.name}?`}
                      deactivateDescription="Dejará de aparecer al armar pedidos. Las ventas ya registradas no cambian."
                      onToggle={(active) => setExtraActive(extra.id, active)}
                    />
                  </TableCell>
                  <TableCell className="pr-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Editar ${extra.name}`}
                      onClick={() => setEditing(extra)}
                    >
                      <PencilIcon data-icon="inline-start" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
      {current.totalCount > 0 && (
        <PaginationBar
          page={current.page}
          pageSize={current.pageSize}
          itemCount={current.items.length}
          totalCount={current.totalCount}
          totalPages={current.totalPages}
          onPageChange={setPage}
        />
      )}

      {editing && <ExtraFormDialog key={editing.id} extra={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
