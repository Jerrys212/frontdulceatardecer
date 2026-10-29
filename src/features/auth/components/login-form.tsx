"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { login } from "@/actions/auth/login";
import { LoginSchema, type LoginInput } from "@/actions/auth/schemas";
import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ActionFailure } from "@/types/api";

export function LoginForm() {
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await login(values);
    setFailure(result);
    form.resetField("password");
    form.setFocus("password");
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormErrorAlert failure={failure} />
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="username">Usuario</FieldLabel>
              <Input
                {...field}
                id="username"
                className="h-9"
                placeholder="tu.usuario"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <PasswordInput
                {...field}
                id="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Spinner data-icon="inline-start" />}
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
