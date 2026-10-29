"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FolderPlusIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { createCategory } from "@/actions/categories/category-actions";
import {
  CreateCategorySchema,
  MAX_SUBCATEGORIES_ON_CREATE,
  type CreateCategoryInput,
} from "@/actions/categories/schemas";
import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ActionFailure } from "@/types/api";

const EMPTY_VALUES: CreateCategoryInput = { name: "", subcategories: [] };

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: EMPTY_VALUES,
  });
  const subcategories = useFieldArray({ control: form.control, name: "subcategories" });
  const canAddMore = subcategories.fields.length < MAX_SUBCATEGORIES_ON_CREATE;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(EMPTY_VALUES);
      setFailure(null);
    }
  }

  function addSubcategory() {
    if (canAddMore) subcategories.append({ name: "" }, { shouldFocus: true });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await createCategory(values);
    if (!result.success) {
      setFailure(result);
      return;
    }
    toast.success(result.message);
    handleOpenChange(false);
  });

  const isSubmitting = form.formState.isSubmitting;
  const subcategoriesError = form.formState.errors.subcategories?.root ?? form.formState.errors.subcategories;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <FolderPlusIcon />
          Nueva categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>Puedes agregar sus subcategorías ahora o después.</DialogDescription>
        </DialogHeader>
        <form id="create-category-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <FormErrorAlert failure={failure} />
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="category-name">Nombre</FieldLabel>
                <Input
                  {...field}
                  id="category-name"
                  className="h-9"
                  placeholder="ej. Crepas"
                  autoComplete="off"
                  maxLength={50}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FieldSet className="gap-3">
            <FieldLegend variant="label">Subcategorías</FieldLegend>
            {subcategories.fields.length === 0 && (
              <FieldDescription>Por ejemplo: Dulces, Saladas. Los productos se agrupan por subcategoría.</FieldDescription>
            )}
            <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {subcategories.fields.map((item, index) => (
                <li key={item.id}>
                  <Controller
                    control={form.control}
                    name={`subcategories.${index}.name`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="gap-1">
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            className="h-9"
                            placeholder={`Subcategoría ${index + 1}`}
                            aria-label={`Subcategoría ${index + 1}`}
                            autoComplete="off"
                            maxLength={50}
                            aria-invalid={fieldState.invalid}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              addSubcategory();
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                            aria-label={`Quitar subcategoría ${index + 1}`}
                            onClick={() => subcategories.remove(index)}
                          >
                            <XIcon />
                          </Button>
                        </div>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </li>
              ))}
            </ul>
            {subcategoriesError?.message && <FieldError>{subcategoriesError.message}</FieldError>}
            <Button type="button" variant="outline" className="self-start" disabled={!canAddMore} onClick={addSubcategory}>
              <PlusIcon />
              Agregar subcategoría
            </Button>
          </FieldSet>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="create-category-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {isSubmitting ? "Creando…" : "Crear categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
