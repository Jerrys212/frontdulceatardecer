import { Suspense } from "react";
import type { Metadata } from "next";

import { getCurrentUser } from "@/data/auth/get-current-user";
import { ROLE_LABELS } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Inicio",
};

async function Welcome() {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">Hola, {user.fullName}</h1>
      <p className="text-muted-foreground">Entraste como {ROLE_LABELS[user.role]}.</p>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Suspense fallback={<div className="h-14 w-72 animate-pulse rounded-md bg-muted" />}>
        <Welcome />
      </Suspense>
      <section
        aria-label="Próximamente"
        className="rounded-md border border-border-translucent bg-card p-6 text-sm text-muted-foreground"
      >
        Aquí aparecerán los módulos de tu rol (punto de venta, pendientes, catálogo, usuarios y reportes).
      </section>
    </div>
  );
}
