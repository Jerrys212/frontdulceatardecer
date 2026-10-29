import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/data/auth/get-current-user";
import { getUsers } from "@/data/users/get-users";
import { UsersQuerySchema, type UsersQuery } from "@/data/users/types";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { UsersFilters } from "@/features/users/components/users-filters";
import { UsersTable } from "@/features/users/components/users-table";
import { getHomePath } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Usuarios",
};

type SearchParams = PageProps<"/users">["searchParams"];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildUsersHref(query: UsersQuery, page: number) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/users?${queryString}` : "/users";
}

async function UsersSection({ searchParams }: { searchParams: SearchParams }) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "Admin") redirect(getHomePath(currentUser.role));

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
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="font-medium">
              {result.totalCount > 0 ? "Esta página ya no tiene usuarios" : "No encontramos usuarios"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasFilters ? "Prueba con otra búsqueda o quita los filtros." : "Crea el primero con «Nuevo usuario»."}
            </p>
            {(hasFilters || result.totalCount > 0) && (
              <Button asChild variant="outline" size="sm">
                <Link href={result.totalCount > 0 ? buildUsersHref(query, 1) : "/users"}>
                  {result.totalCount > 0 ? "Ir a la primera página" : "Quitar filtros"}
                </Link>
              </Button>
            )}
          </div>
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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <CreateUserDialog />
      </header>
      <Suspense fallback={<Skeleton className="h-9 w-full" />}>
        <UsersFilters />
      </Suspense>
      <Suspense fallback={<UsersSectionSkeleton />}>
        <UsersSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
