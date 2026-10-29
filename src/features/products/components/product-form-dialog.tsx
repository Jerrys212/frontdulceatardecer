"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createProduct, updateProduct } from "@/actions/products/product-actions";
import { ProductFormSchema, type ProductFormInput, type ProductFormOutput } from "@/actions/products/schemas";
import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { PriceInput } from "@/components/forms/price-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/data/categories/types";
import type { Product } from "@/data/products/types";
import type { ActionFailure } from "@/types/api";

type ProductFormDialogProps = {
  product?: Product;
  categories: Category[];
  onClose: () => void;
};

export function CreateProductButton({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Nuevo producto
      </Button>
      {open && <ProductFormDialog categories={categories} onClose={() => setOpen(false)} />}
    </>
  );
}

export function ProductFormDialog({ product, categories, onClose }: ProductFormDialogProps) {
  const isEditing = product !== undefined;
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? product.price.toFixed(2) : "",
      categoryId: product?.categoryId ?? "",
      subcategoryId: product?.subcategoryId ?? "",
    },
  });

  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? [];
  const descriptionLength = useWatch({ control: form.control, name: "description" }).length;

  const onSubmit = form.handleSubmit(async () => {
    setFailure(null);
    const values = form.getValues();
    const result = isEditing ? await updateProduct(product.id, values) : await createProduct(values);
    if (!result.success) {
      setFailure(result);
      return;
    }
    toast.success(result.message);
    onClose();
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Las ventas ya registradas conservan el nombre y precio con que se vendieron."
              : "Aparecerá en el punto de venta dentro de su categoría y subcategoría."}
          </DialogDescription>
        </DialogHeader>
        <form id="product-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FormErrorAlert failure={failure} />
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-category">Categoría</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("subcategoryId", "", { shouldDirty: true });
                      }}
                    >
                      <SelectTrigger
                        id="product-category"
                        autoFocus={!isEditing}
                        className="h-9 w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} disabled={!category.isActive}>
                              {category.name}
                              {!category.isActive && " (inactiva)"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="subcategoryId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-subcategory">Subcategoría</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={subcategories.length === 0}>
                      <SelectTrigger id="product-subcategory" className="h-9 w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={categoryId ? "Selecciona" : "Elige una categoría"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id} disabled={!subcategory.isActive}>
                              {subcategory.name}
                              {!subcategory.isActive && " (inactiva)"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {categoryId && subcategories.length === 0 && (
                      <FieldDescription>Esta categoría no tiene subcategorías. Agrégalas en Categorías.</FieldDescription>
                    )}
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
                  <Input
                    {...field}
                    id="product-name"
                    className="h-9"
                    placeholder="ej. Crepa de Nutella y plátano"
                    autoComplete="off"
                    maxLength={100}
                    autoFocus={isEditing}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-description">
                    Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="product-description"
                    rows={2}
                    maxLength={250}
                    placeholder="ej. Nutella, plátano en rodajas y azúcar glass."
                    aria-invalid={fieldState.invalid}
                  />
                  {!fieldState.invalid && (
                    <FieldDescription className="text-right tabular-nums">{descriptionLength}/250</FieldDescription>
                  )}
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="price"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-price">Precio</FieldLabel>
                  <PriceInput
                    {...field}
                    id="product-price"
                    groupClassName="h-9 sm:max-w-48"
                    aria-invalid={fieldState.invalid}
                  />
                  {!fieldState.invalid && <FieldDescription>IVA incluido.</FieldDescription>}
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="product-form" disabled={isSubmitting || isEditing && !form.formState.isDirty}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
