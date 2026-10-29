"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { NameSchema, type NameInput } from "@/actions/categories/schemas";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ActionFailure, ActionResult } from "@/types/api";

type NameDialogProps = {
  title: string;
  description: string;
  label: string;
  placeholder?: string;
  initialName?: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (input: NameInput) => Promise<ActionResult>;
  onClose: () => void;
};

export function NameDialog({
  title,
  description,
  label,
  placeholder,
  initialName = "",
  submitLabel,
  pendingLabel,
  onSubmit,
  onClose,
}: NameDialogProps) {
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const form = useForm<NameInput>({
    resolver: zodResolver(NameSchema),
    defaultValues: { name: initialName },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setFailure(null);
    const result = await onSubmit(values);
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form id="name-dialog-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormErrorAlert failure={failure} />
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name-dialog-input">{label}</FieldLabel>
                <Input
                  {...field}
                  id="name-dialog-input"
                  className="h-9"
                  placeholder={placeholder}
                  autoComplete="off"
                  maxLength={50}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="name-dialog-form" disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
