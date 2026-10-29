"use client";

import { useMemo, useState } from "react";
import { ChevronRightIcon, PencilIcon, PlusIcon, SearchIcon } from "lucide-react";
import { cn } from "cn";

import {
  createSubcategory,
  renameCategory,
  renameSubcategory,
  setCategoryActive,
  setSubcategoryActive,
} from "@/actions/categories/category-actions";
import { ActiveSwitch } from "@/components/active-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Subcategory } from "@/data/categories/types";
import { NameDialog } from "@/features/categories/components/name-dialog";

type StatusFilter = "all" | "active" | "inactive";

type DialogState =
  | { type: "rename-category"; category: Category }
  | { type: "add-subcategory"; category: Category }
  | { type: "rename-subcategory"; category: Category; subcategory: Subcategory }
  | null;

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-MX");
}

function subcategorySummary(subcategories: Subcategory[]) {
  if (subcategories.length === 0) return "Sin subcategorías";
  const inactive = subcategories.filter((subcategory) => !subcategory.isActive).length;
  const total = `${subcategories.length} ${subcategories.length === 1 ? "subcategoría" : "subcategorías"}`;
  return inactive > 0 ? `${total} · ${inactive} ${inactive === 1 ? "inactiva" : "inactivas"}` : total;
}

export function CategoriesList({ categories }: { categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = () => setDialog(null);

  const term = normalize(search.trim());
  const visible = useMemo(
    () =>
      categories
        .filter((category) => status === "all" || category.isActive === (status === "active"))
        .map((category) => ({
          category,
          matchesSubcategory:
            term !== "" &&
            !normalize(category.name).includes(term) &&
            category.subcategories.some((subcategory) => normalize(subcategory.name).includes(term)),
        }))
        .filter(({ category, matchesSubcategory }) => term === "" || normalize(category.name).includes(term) || matchesSubcategory),
    [categories, status, term],
  );

  function toggleExpanded(id: string, open: boolean) {
    setExpanded((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar categoría o subcategoría"
            aria-label="Buscar categoría o subcategoría"
          />
        </InputGroup>
        <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
          <SelectTrigger className="h-9 w-full bg-card sm:w-40" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Estado: todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="inactive">Inactivas</SelectItem>
          </SelectContent>
        </Select>
      </search>

      <section aria-label="Categorías" className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
            <p className="font-medium">
              {categories.length === 0 ? "Aún no hay categorías" : "No encontramos categorías"}
            </p>
            <p className="text-sm text-muted-foreground">
              {categories.length === 0
                ? "Crea la primera con «Nueva categoría»."
                : "Prueba con otra búsqueda o cambia el filtro de estado."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map(({ category, matchesSubcategory }) => {
              const open = expanded.has(category.id) || matchesSubcategory;
              return (
                <li key={category.id}>
                  <Collapsible open={open} onOpenChange={(next) => toggleExpanded(category.id, next)}>
                    <div className={cn("flex items-center gap-3 px-4 py-3", !category.isActive && "text-muted-foreground")}>
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="group flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <ChevronRightIcon
                            className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
                            aria-hidden="true"
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="flex flex-wrap items-center gap-2 font-medium">
                              {category.name}
                              {!category.isActive && (
                                <Badge variant="outline" className="rounded-sm">
                                  Inactiva
                                </Badge>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {subcategorySummary(category.subcategories)}
                            </span>
                          </span>
                        </button>
                      </CollapsibleTrigger>
                      <ActiveSwitch
                        checked={category.isActive}
                        label={`${category.isActive ? "Desactivar" : "Activar"} ${category.name}`}
                        deactivateTitle={`¿Desactivar ${category.name}?`}
                        deactivateDescription="Sus productos dejarán de aparecer en el punto de venta. Puedes activarla de nuevo cuando quieras."
                        onToggle={(active) => setCategoryActive(category.id, active)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => setDialog({ type: "rename-category", category })}
                      >
                        <PencilIcon />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </div>
                    <CollapsibleContent>
                      <div className="border-t border-border bg-background/60 px-4 py-3 pl-11">
                        {!category.isActive && (
                          <p className="mb-2 text-xs text-muted-foreground">
                            La categoría está inactiva: ninguna de sus subcategorías aparece en el punto de venta.
                          </p>
                        )}
                        {category.subcategories.length > 0 && (
                          <ul className="flex flex-col">
                            {category.subcategories.map((subcategory) => {
                              const highlighted = term !== "" && normalize(subcategory.name).includes(term);
                              return (
                                <li
                                  key={subcategory.id}
                                  className={cn(
                                    "flex items-center gap-3 rounded-md px-2 py-1.5",
                                    highlighted && "bg-primary/10",
                                    !subcategory.isActive && "text-muted-foreground",
                                  )}
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                                    <span className="truncate">{subcategory.name}</span>
                                    {!subcategory.isActive && (
                                      <Badge variant="outline" className="rounded-sm">
                                        Inactiva
                                      </Badge>
                                    )}
                                  </span>
                                  <ActiveSwitch
                                    checked={subcategory.isActive}
                                    label={`${subcategory.isActive ? "Desactivar" : "Activar"} ${subcategory.name}`}
                                    deactivateTitle={`¿Desactivar ${subcategory.name}?`}
                                    deactivateDescription="Sus productos dejarán de aparecer en el punto de venta. Puedes activarla de nuevo cuando quieras."
                                    onToggle={(active) => setSubcategoryActive(category.id, subcategory.id, active)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground"
                                    aria-label={`Editar ${subcategory.name}`}
                                    onClick={() => setDialog({ type: "rename-subcategory", category, subcategory })}
                                  >
                                    <PencilIcon />
                                  </Button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 px-2"
                          onClick={() => setDialog({ type: "add-subcategory", category })}
                        >
                          <PlusIcon />
                          Agregar subcategoría
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
            toggleExpanded(dialog.category.id, true);
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
