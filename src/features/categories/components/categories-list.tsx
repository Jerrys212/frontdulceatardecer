"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import { cn } from "cn";

import {
  createSubcategory,
  renameCategory,
  renameSubcategory,
  setCategoryActive,
  setSubcategoryActive,
} from "@/actions/categories/category-actions";
import { ActiveSwitch } from "@/components/active-switch";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/forms/search-input";
import { StatusSelect } from "@/components/forms/status-select";
import { PaginationBar } from "@/components/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Category, Subcategory } from "@/data/categories/types";
import { NameDialog } from "@/features/categories/components/name-dialog";
import { paginate } from "@/lib/pagination";
import { normalizeSearchText } from "@/lib/utils";
import { matchesStatus, type StatusFilter } from "@/lib/validations/status";

type DialogState =
  | { type: "rename-category"; category: Category }
  | { type: "add-subcategory"; category: Category }
  | { type: "rename-subcategory"; category: Category; subcategory: Subcategory }
  | null;

const DEACTIVATE_DESCRIPTION =
  "Sus productos dejarán de aparecer en el punto de venta. Puedes activarla de nuevo cuando quieras.";

function subcategoryCount(subcategories: Subcategory[]) {
  const inactive = subcategories.filter((subcategory) => !subcategory.isActive).length;
  return inactive > 0 ? `${subcategories.length} (${inactive} ${inactive === 1 ? "inactiva" : "inactivas"})` : `${subcategories.length}`;
}

export function CategoriesList({ categories }: { categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = () => setDialog(null);

  const term = normalizeSearchText(search.trim());
  const visible = useMemo(
    () =>
      categories
        .filter((category) => matchesStatus(category.isActive, status))
        .map((category) => ({
          category,
          matchesSubcategory:
            term !== "" &&
            !normalizeSearchText(category.name).includes(term) &&
            category.subcategories.some((subcategory) => normalizeSearchText(subcategory.name).includes(term)),
        }))
        .filter(
          ({ category, matchesSubcategory }) =>
            term === "" || normalizeSearchText(category.name).includes(term) || matchesSubcategory,
        ),
    [categories, status, term],
  );
  const current = paginate(visible, page);

  function setCategoryExpanded(id: string, open: boolean) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <>
      <search className="flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={search}
          label="Buscar categoría o subcategoría"
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
          feminine
        />
      </search>

      <section aria-label="Categorías" className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {visible.length === 0 ? (
          <EmptyState
            title={categories.length === 0 ? "Aún no hay categorías" : "No encontramos categorías"}
            description={
              categories.length === 0
                ? "Crea la primera con «Nueva categoría»."
                : "Prueba con otra búsqueda o cambia el filtro de estado."
            }
          />
        ) : (
          <Table className="sm:table-fixed">
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="pl-4 sm:w-1/2">Nombre</TableHead>
                <TableHead className="text-center">Subcategorías</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.items.map(({ category, matchesSubcategory }) => {
                const open = expanded.has(category.id) || matchesSubcategory;
                return (
                  <Fragment key={category.id}>
                    <TableRow className={cn(!category.isActive && "text-muted-foreground")}>
                      <TableCell className="pl-2 font-medium">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={`${open ? "Ocultar" : "Mostrar"} subcategorías de ${category.name}`}
                          onClick={() => setCategoryExpanded(category.id, !open)}
                          className="group flex w-full items-center gap-2 rounded-md px-2 py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <ChevronRightIcon
                            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
                            aria-hidden="true"
                          />
                          <span className="flex flex-wrap items-center gap-2">
                            {category.name}
                            {!category.isActive && <Badge variant="outline">Inactiva</Badge>}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">{subcategoryCount(category.subcategories)}</TableCell>
                      <TableCell className="text-center">
                        <ActiveSwitch
                          checked={category.isActive}
                          label={`${category.isActive ? "Desactivar" : "Activar"} ${category.name}`}
                          deactivateTitle={`¿Desactivar ${category.name}?`}
                          deactivateDescription={DEACTIVATE_DESCRIPTION}
                          onToggle={(active) => setCategoryActive(category.id, active)}
                        />
                      </TableCell>
                      <TableCell className="pr-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Editar ${category.name}`}
                          onClick={() => setDialog({ type: "rename-category", category })}
                        >
                          <PencilIcon data-icon="inline-start" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      </TableCell>
                    </TableRow>

                    {open &&
                      category.subcategories.map((subcategory) => {
                        const highlighted = term !== "" && normalizeSearchText(subcategory.name).includes(term);
                        return (
                          <TableRow
                            key={subcategory.id}
                            className={cn(
                              "bg-background/60",
                              highlighted && "bg-primary/10",
                              !subcategory.isActive && "text-muted-foreground",
                            )}
                          >
                            <TableCell className="pl-12">
                              <span className="flex flex-wrap items-center gap-2 text-sm">
                                {subcategory.name}
                                {!subcategory.isActive && <Badge variant="outline">Inactiva</Badge>}
                              </span>
                            </TableCell>
                            <TableCell />
                            <TableCell className="text-center">
                              <ActiveSwitch
                                checked={subcategory.isActive}
                                label={`${subcategory.isActive ? "Desactivar" : "Activar"} ${subcategory.name}`}
                                deactivateTitle={`¿Desactivar ${subcategory.name}?`}
                                deactivateDescription={DEACTIVATE_DESCRIPTION}
                                onToggle={(active) => setSubcategoryActive(category.id, subcategory.id, active)}
                              />
                            </TableCell>
                            <TableCell className="pr-4 text-center">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground"
                                aria-label={`Editar ${subcategory.name}`}
                                onClick={() => setDialog({ type: "rename-subcategory", category, subcategory })}
                              >
                                <PencilIcon />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                    {open && (
                      <TableRow className="bg-background/60 hover:bg-background/60">
                        <TableCell colSpan={4} className="pl-10 whitespace-normal">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="px-2"
                              onClick={() => setDialog({ type: "add-subcategory", category })}
                            >
                              <PlusIcon data-icon="inline-start" />
                              Agregar subcategoría
                            </Button>
                            {!category.isActive && (
                              <p className="text-xs text-muted-foreground">
                                La categoría está inactiva: ninguna de sus subcategorías aparece en el punto de venta.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
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

      {dialog?.type === "rename-category" && (
        <NameDialog
          title="Editar categoría"
          description="El nombre debe ser único en todo el catálogo."
          label="Nombre"
          initialName={dialog.category.name}
          submitLabel="Guardar"
          pendingLabel="Guardando…"
          onSubmit={(input) => renameCategory(dialog.category.id, input)}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "add-subcategory" && (
        <NameDialog
          title={`Nueva subcategoría en ${dialog.category.name}`}
          description="El nombre debe ser único dentro de la categoría."
          label="Nombre"
          placeholder="ej. Dulces"
          submitLabel="Agregar"
          pendingLabel="Agregando…"
          onSubmit={(input) => createSubcategory(dialog.category.id, input)}
          onClose={() => {
            setCategoryExpanded(dialog.category.id, true);
            closeDialog();
          }}
        />
      )}
      {dialog?.type === "rename-subcategory" && (
        <NameDialog
          title="Editar subcategoría"
          description={`Subcategoría de ${dialog.category.name}. El nombre debe ser único dentro de la categoría.`}
          label="Nombre"
          initialName={dialog.subcategory.name}
          submitLabel="Guardar"
          pendingLabel="Guardando…"
          onSubmit={(input) => renameSubcategory(dialog.category.id, dialog.subcategory.id, input)}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
