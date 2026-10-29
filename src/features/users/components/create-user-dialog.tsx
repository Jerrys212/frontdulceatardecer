"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2Icon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createUser } from "@/actions/users/create-user";
import { CreateUserSchema, type CreateUserInput } from "@/actions/users/schemas";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RoleSelect } from "@/features/users/components/role-select";
import { TemporaryPasswordDialog, type TemporaryPassword } from "@/features/users/components/temporary-password-dialog";
import type { ActionFailure } from "@/types/api";

const EMPTY_VALUES: CreateUserInput = { username: "", fullName: "", role: "" };

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<TemporaryPassword | null>(null);
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: EMPTY_VALUES,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(EMPTY_VALUES);
      setFailure(null);
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await createUser(values);
    if (!result.success) {
      setFailure(result);
      return;
    }
    toast.success(result.message);
    handleOpenChange(false);
    setTemporaryPassword({ fullName: result.data.fullName, password: result.data.temporaryPassword });
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="lg">
            <UserPlusIcon />
            Nuevo usuario
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Se generará una contraseña temporal que deberá cambiar al entrar.</DialogDescription>
          </DialogHeader>
          <form id="create-user-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormErrorAlert failure={failure} />
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-username">Usuario</FieldLabel>
                    <Input
                      {...field}
                      id="create-username"
                      className="h-9"
                      placeholder="ej. ana.lopez"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-invalid={fieldState.invalid}
                    />
                    {!fieldState.invalid && (
                      <FieldDescription>Letras, números, punto, guion o guion bajo. No se puede cambiar después.</FieldDescription>
                    )}
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-full-name">Nombre completo</FieldLabel>
                    <Input
                      {...field}
                      id="create-full-name"
                      className="h-9"
                      placeholder="ej. Ana López"
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
                    <FieldLabel htmlFor="create-role">Rol</FieldLabel>
                    <RoleSelect id="create-role" value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
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
            <Button type="submit" form="create-user-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {isSubmitting ? "Creando…" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TemporaryPasswordDialog value={temporaryPassword} onClose={() => setTemporaryPassword(null)} />
    </>
  );
}
