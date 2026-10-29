import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/data/auth/require-role";
import { getPendingSales } from "@/data/sales/get-sales";
import { AutoRefresh } from "@/features/sales/components/auto-refresh";
import { PendingSaleCard } from "@/features/sales/components/pending-sale-card";

export const metadata: Metadata = {
  title: "Pendientes",
};

const REFRESH_INTERVAL_MS = 15_000;

async function PendingSales() {
  const user = await requireRole(["Admin", "Cashier", "Kitchen"]);
  const sales = await getPendingSales();
  const canSell = user.role !== "Kitchen";

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          Pedidos en preparación
          <Badge variant="warning" className="h-7 min-w-7">
            {sales.length}
          </Badge>
        </h1>
        <AutoRefresh intervalMs={REFRESH_INTERVAL_MS} />
      </header>
      {sales.length === 0 ? (
        <section aria-label="Pedidos" className="rounded-md border border-border-translucent bg-card">
          <EmptyState
            title="No hay pedidos en preparación"
            description="Los pedidos registrados aparecerán aquí hasta que se cobren o cancelen."
          >
            {canSell && (
              <Button asChild>
                <Link href="/pos">
                  <PlusIcon data-icon="inline-start" />
                  Nueva venta
                </Link>
              </Button>
            )}
          </EmptyState>
        </section>
      ) : (
        <section aria-label="Pedidos" className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sales.map((sale) => (
            <PendingSaleCard key={sale.id} sale={sale} role={user.role} />
          ))}
        </section>
      )}
    </>
  );
}

function PendingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando pedidos">
      <Skeleton className="h-8 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export default function PendingSalesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Suspense fallback={<PendingSkeleton />}>
        <PendingSales />
      </Suspense>
    </div>
  );
}
