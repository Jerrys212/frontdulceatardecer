"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { changePassword } from "@/actions/auth/change-password";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/actions/auth/schemas";
import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ActionFailure } from "@/types/api";

type PasswordFieldConfig = {
  name: FieldPath<ChangePasswordInput>;
  label: string;
  autoComplete: "current-password" | "new-password";
  description?: string;
};

const FIELDS: PasswordFieldConfig[] = [
  { name: "currentPassword", label: "Contraseña actual", autoComplete: "current-password" },
  {
    name: "newPassword",
    label: "Nueva contraseña",
    autoComplete: "new-password",
    description: "Mínimo 10 caracteres y distinta de tu nombre de usuario.",
  },
  { name: "confirmPassword", label: "Confirma la nueva contraseña", autoComplete: "new-password" },
];

type ChangePasswordFormProps = {
  redirectTo: string;
};

export function ChangePasswordForm({ redirectTo }: ChangePasswordFormProps) {
  const router = useRouter();
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await changePassword(values);
    if (!result.success) {
      setFailure(result);
      return;
    }
    toast.success(result.message);
    router.replace(redirectTo);
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormErrorAlert failure={failure} />
      <FieldGroup className="gap-4">
        {FIELDS.map(({ name, label, autoComplete, description }) => (
          <Controller
            key={name}
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={name}>{label}</FieldLabel>
                <PasswordInput
                  {...field}
                  id={name}
                  autoComplete={autoComplete}
                  aria-invalid={fieldState.invalid}
                />
                {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
      </FieldGroup>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
