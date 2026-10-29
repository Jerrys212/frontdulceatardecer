import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-role";
import { getAllExtras } from "@/data/extras/get-all-extras";
import { CreateExtraButton } from "@/features/extras/components/extra-form-dialog";
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
      <PageHeader title="Extras" description="Agregados opcionales para cada renglón del pedido. Pueden ser gratis.">
        <CreateExtraButton />
      </PageHeader>
      <Suspense fallback={<ExtrasSkeleton />}>
        <ExtrasSection />
      </Suspense>
    </div>
  );
}
