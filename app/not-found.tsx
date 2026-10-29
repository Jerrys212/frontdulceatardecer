import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <h1 className="sr-only">Página no encontrada</h1>
      <EmptyState
        title="No encontramos lo que buscas"
        description="La página o el registro no existe o ya no está disponible."
      >
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeftIcon data-icon="inline-start" />
            Volver al inicio
          </Link>
        </Button>
      </EmptyState>
    </main>
  );
}
