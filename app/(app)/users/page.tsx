import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-role";
import { getUsers } from "@/data/users/get-users";
import { UsersQuerySchema, type UsersQuery } from "@/data/users/types";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { UsersFilters } from "@/features/users/components/users-filters";
import { UsersTable } from "@/features/users/components/users-table";
import { firstValue, withQuery } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Usuarios",
};

type SearchParams = PageProps<"/users">["searchParams"];

function buildUsersHref(query: UsersQuery, page: number) {
  return withQuery("/users", { ...query, page: page > 1 ? page : undefined });
}

async function UsersSection({ searchParams }: { searchParams: SearchParams }) {
  const currentUser = await requireAdmin();

  const raw = await searchParams;
  const query = UsersQuerySchema.parse({
    search: firstValue(raw.search),
    role: firstValue(raw.role),
    status: firstValue(raw.status),
    page: firstValue(raw.page),
  });
  const result = await getUsers(query);
  const hasFilters = Boolean(query.search || query.role || query.status);

  return (
    <section aria-label="Lista de usuarios" className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {result.items.length > 0 ? (
          <UsersTable users={result.items} currentUserId={currentUser.id} />
        ) : (
          <EmptyState
            title={result.totalCount > 0 ? "Esta página ya no tiene usuarios" : "No encontramos usuarios"}
            description={
              hasFilters ? "Prueba con otra búsqueda o quita los filtros." : "Crea el primero con «Nuevo usuario»."
            }
          >
            {(hasFilters || result.totalCount > 0) && (
              <Button asChild variant="outline" size="sm">
                <Link href={result.totalCount > 0 ? buildUsersHref(query, 1) : "/users"}>
                  {result.totalCount > 0 ? "Ir a la primera página" : "Quitar filtros"}
                </Link>
              </Button>
            )}
          </EmptyState>
        )}
      </div>
      <PaginationBar
        page={result.page}
        pageSize={result.pageSize}
        itemCount={result.items.length}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        hrefForPage={(page) => buildUsersHref(query, page)}
      />
    </section>
  );
}

function UsersSectionSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-translucent bg-card p-4" aria-busy="true" aria-label="Cargando usuarios">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function UsersPage({ searchParams }: PageProps<"/users">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader title="Usuarios">
        <CreateUserDialog />
      </PageHeader>
      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <UsersFilters />
      </Suspense>
      <Suspense fallback={<UsersSectionSkeleton />}>
        <UsersSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
