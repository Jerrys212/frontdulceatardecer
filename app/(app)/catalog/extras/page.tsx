import { Suspense } from "react";
import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-admin";
import { getAllExtras } from "@/data/extras/get-all-extras";
import { CreateExtraButton } from "@/features/extras/components/create-extra-button";
import { ExtrasTable } from "@/features/extras/components/extras-table";

export const metadata: Metadata = {
  title: "Extras",
};

async function ExtrasSection() {
  await requireAdmin();
  const extras = await getAllExtras();
  return <ExtrasTable extras={extras} />;
}

function ExtrasSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando extras">
      <Skeleton className="h-9 w-full" />
      <div className="flex flex-col gap-2 rounded-md border border-border-translucent bg-card p-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function ExtrasPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Extras</h1>
          <p className="text-sm text-muted-foreground">
            Agregados opcionales para cada renglón del pedido. Pueden ser gratis.
          </p>
        </div>
        <CreateExtraButton />
      </header>
      <Suspense fallback={<ExtrasSkeleton />}>
        <ExtrasSection />
      </Suspense>
    </div>
  );
}
