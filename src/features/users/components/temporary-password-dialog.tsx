"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type TemporaryPassword = {
  fullName: string;
  password: string;
};

type TemporaryPasswordDialogProps = {
  value: TemporaryPassword | null;
  onClose: () => void;
};

export function TemporaryPasswordDialog({ value, onClose }: TemporaryPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value.password);
      setCopied(true);
    } catch {
      toast.error("No se pudo copiar", { description: "Selecciona la contraseña y cópiala manualmente." });
    }
  }

  return (
    <Dialog
      open={value !== null}
      onOpenChange={(open) => {
        if (open) return;
        setCopied(false);
        onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md" onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader className="items-center text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRoundIcon className="size-5" />
          </span>
          <DialogTitle>Contraseña temporal de {value?.fullName}</DialogTitle>
          <DialogDescription className="sr-only">Contraseña temporal generada para el usuario</DialogDescription>
        </DialogHeader>
        <div className="flex items-stretch gap-2">
          <output
            aria-label="Contraseña temporal"
            className="flex flex-1 items-center justify-center rounded-md bg-muted px-3 py-3 font-mono text-2xl tracking-[0.2em] select-all"
          >
            {value?.password}
          </output>
          <Button type="button" variant="outline" className="h-auto" onClick={copyPassword}>
            {copied ? <CheckIcon data-icon="inline-start" className="text-success" /> : <CopyIcon data-icon="inline-start" />}
            {copied ? "Copiada" : "Copiar"}
          </Button>
        </div>
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertDescription>
            Esta contraseña no se volverá a mostrar. Entrégala al usuario: deberá cambiarla al iniciar sesión.
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => {
            setCopied(false);
            onClose();
          }}
        >
          Listo
        </Button>
      </DialogContent>
    </Dialog>
  );
}
