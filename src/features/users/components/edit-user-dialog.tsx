"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { UpdateUserSchema, type UpdateUserInput } from "@/actions/users/schemas";
import { updateUser } from "@/actions/users/user-actions";
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
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/data/users/types";
import { RoleSelect } from "@/features/users/components/role-select";
import type { ActionFailure } from "@/types/api";

type EditUserDialogProps = {
  user: User;
  isSelf: boolean;
  onClose: () => void;
};

export function EditUserDialog({ user, isSelf, onClose }: EditUserDialogProps) {
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: { fullName: user.fullName, role: user.role },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await updateUser(user.id, values);
    if (!result.success) {
      setFailure(result);
      return;
    }
    toast.success(result.message);
    onClose();
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Cambiar el rol cierra todas las sesiones del usuario.</DialogDescription>
        </DialogHeader>
        <form id="edit-user-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FormErrorAlert failure={failure} />
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="edit-username">Usuario</FieldLabel>
              <Input id="edit-username" className="h-9" value={user.username} disabled readOnly />
              <FieldDescription>El nombre de usuario no se puede cambiar.</FieldDescription>
            </Field>
            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-full-name">Nombre completo</FieldLabel>
                  <Input
                    {...field}
                    id="edit-full-name"
                    className="h-9"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-role">Rol</FieldLabel>
                  <RoleSelect
                    id="edit-role"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSelf}
                    invalid={fieldState.invalid}
                  />
                  {isSelf && <FieldDescription>No puedes cambiar tu propio rol.</FieldDescription>}
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
          <Button type="submit" form="edit-user-form" disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
