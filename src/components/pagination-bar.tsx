import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationBarProps = {
  page: number;
  pageSize: number;
  itemCount: number;
  totalCount: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export function PaginationBar({ page, pageSize, itemCount, totalCount, totalPages, hrefForPage }: PaginationBarProps) {
  const first = itemCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = itemCount === 0 ? 0 : first + itemCount - 1;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        Mostrando {first}–{last} de {totalCount}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {hasPrevious ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefForPage(page - 1)} scroll={false}>
                <ChevronLeftIcon />
                Anterior
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeftIcon />
              Anterior
            </Button>
          )}
          <span aria-current="page">
            {page} / {totalPages}
          </span>
          {hasNext ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefForPage(page + 1)} scroll={false}>
                Siguiente
                <ChevronRightIcon />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Siguiente
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
