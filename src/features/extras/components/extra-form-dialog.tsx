"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { createExtra, updateExtra } from "@/actions/extras/extra-actions";
import { ExtraFormSchema, type ExtraFormInput, type ExtraFormOutput } from "@/actions/extras/schemas";
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
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import type { Extra } from "@/data/extras/types";
import type { ActionFailure } from "@/types/api";

type ExtraFormDialogProps = {
  extra?: Extra;
  onClose: () => void;
};

export function ExtraFormDialog({ extra, onClose }: ExtraFormDialogProps) {
  const isEditing = extra !== undefined;
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<ExtraFormInput, unknown, ExtraFormOutput>({
    resolver: zodResolver(ExtraFormSchema),
    defaultValues: { name: extra?.name ?? "", price: extra ? extra.price.toFixed(2) : "" },
  });

  const onSubmit = form.handleSubmit(async () => {
    setFailure(null);
    const values = form.getValues();
    const result = isEditing ? await updateExtra(extra.id, values) : await createExtra(values);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar extra" : "Nuevo extra"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Las ventas ya registradas conservan el nombre y precio con que se vendieron."
              : "Se agrega a los renglones del pedido, por ejemplo «Extra fresa» o «Chispas»."}
          </DialogDescription>
        </DialogHeader>
        <form id="extra-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FormErrorAlert failure={failure} />
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="extra-name">Nombre</FieldLabel>
                  <Input
                    {...field}
                    id="extra-name"
                    className="h-9"
                    placeholder="ej. Extra fresa"
                    autoComplete="off"
                    maxLength={50}
                    autoFocus
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="price"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="extra-price">Precio</FieldLabel>
                  <InputGroup className="h-9">
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="extra-price"
                      inputMode="decimal"
                      placeholder="0.00"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>MXN</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {!fieldState.invalid && <FieldDescription>IVA incluido. Usa 0 si el extra es gratis.</FieldDescription>}
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
          <Button type="submit" form="extra-form" disabled={isSubmitting || (isEditing && !form.formState.isDirty)}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {isSubmitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear extra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
