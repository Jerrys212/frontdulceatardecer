import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageNavigation =
  | { hrefForPage: (page: number) => string; onPageChange?: never }
  | { onPageChange: (page: number) => void; hrefForPage?: never };

type PaginationBarProps = PageNavigation & {
  page: number;
  pageSize: number;
  itemCount: number;
  totalCount: number;
  totalPages: number;
};

type PageButtonProps = PageNavigation & {
  target: number;
  enabled: boolean;
  children: React.ReactNode;
};

function PageButton({ target, enabled, hrefForPage, onPageChange, children }: PageButtonProps) {
  if (!enabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }
  if (hrefForPage) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href={hrefForPage(target)} scroll={false}>
          {children}
        </Link>
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" onClick={() => onPageChange?.(target)}>
      {children}
    </Button>
  );
}

export function PaginationBar({ page, pageSize, itemCount, totalCount, totalPages, ...navigation }: PaginationBarProps) {
  const first = itemCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = itemCount === 0 ? 0 : first + itemCount - 1;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        Mostrando {first}–{last} de {totalCount}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <PageButton {...navigation} target={page - 1} enabled={page > 1}>
            <ChevronLeftIcon data-icon="inline-start" />
            Anterior
          </PageButton>
          <span aria-current="page">
            {page} / {totalPages}
          </span>
          <PageButton {...navigation} target={page + 1} enabled={page < totalPages}>
            Siguiente
            <ChevronRightIcon data-icon="inline-end" />
          </PageButton>
        </div>
      )}
    </nav>
  );
}
