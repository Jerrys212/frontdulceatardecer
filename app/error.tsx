"use client";

import { useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";

import { reportError } from "@/adapters/error-tracking";
import { Button } from "@/components/ui/button";

export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    reportError(error, { scope: "app/error", digest: error.digest });
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Algo salió mal</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ocurrió un error inesperado. Intenta de nuevo y, si el problema continúa, avisa al administrador.
      </p>
      <Button onClick={retry}>
        <RotateCcwIcon data-icon="inline-start" />
        Reintentar
      </Button>
    </main>
  );
}
