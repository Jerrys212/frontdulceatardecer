"use client";

import { useMemo, useState } from "react";
import { PencilIcon, SearchIcon } from "lucide-react";
import { cn } from "cn";

import { setExtraActive } from "@/actions/extras/extra-actions";
import { ActiveSwitch } from "@/components/active-switch";
import { PaginationBar } from "@/components/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Extra } from "@/data/extras/types";
import { ExtraFormDialog } from "@/features/extras/components/extra-form-dialog";
import { formatCurrency } from "@/lib/formats";
import { paginate } from "@/lib/pagination";
import { normalizeSearchText } from "@/lib/utils";

type StatusFilter = "all" | "active" | "inactive";

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
          (status === "all" || extra.isActive === (status === "active")) &&
          (term === "" || normalizeSearchText(extra.name).includes(term)),
      ),
    [extras, status, term],
  );
  const current = paginate(visible, page);

  return (
    <>
      <search className="flex flex-col gap-2 sm:flex-row">
        <InputGroup className="h-9 bg-card sm:flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar extra"
            aria-label="Buscar extra"
          />
        </InputGroup>
        <Select value={status} onValueChange={(value) => {
            setStatus(value as StatusFilter);
            setPage(1);
          }}>
          <SelectTrigger className="h-9 w-full bg-card sm:w-40" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Estado: todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </search>

      <section aria-label="Extras" className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
            <p className="font-medium">{extras.length === 0 ? "Aún no hay extras" : "No encontramos extras"}</p>
            <p className="text-sm text-muted-foreground">
              {extras.length === 0
                ? "Crea el primero con «Nuevo extra»."
                : "Prueba con otra búsqueda o cambia el filtro de estado."}
            </p>
          </div>
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
                        <Badge variant="outline" className="rounded-sm">
                          Inactivo
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {extra.price === 0 ? (
                      <Badge className="rounded-sm bg-success/15 text-success">Gratis</Badge>
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
                      <PencilIcon />
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
