import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireRole } from "@/data/auth/require-role";
import { getActiveCategories, getActiveExtras, getAvailableProducts } from "@/data/pos/get-pos-catalog";
import { getSale } from "@/data/sales/get-sales";
import { saleNumber, type Sale } from "@/data/sales/types";
import { CartPanel } from "@/features/sales/components/cart-panel";
import { EditSessionLoader } from "@/features/sales/components/edit-session-loader";
import { MobileCartBar } from "@/features/sales/components/mobile-cart-bar";
import { PosCatalogNav } from "@/features/sales/components/pos-catalog-nav";
import { ProductGrid } from "@/features/sales/components/product-grid";
import type { EditSession } from "@/features/sales/store/cart-store";
import { toCents } from "@/lib/money";
import { applyCatalogPrices, type CartLine } from "@/lib/sales/cart";
import { firstValue } from "@/lib/search-params";
import { EntityIdSchema } from "@/lib/validations/ids";

export const metadata: Metadata = {
  title: "Punto de venta",
};

type SearchParams = PageProps<"/pos">["searchParams"];

function toCartLines(sale: Sale): CartLine[] {
  return sale.items.map((item, index) => {
    const extrasCents = item.extras.reduce((sum, extra) => sum + toCents(extra.price) * extra.quantity, 0);
    return {
      key: `${sale.id}-${index}`,
      productId: item.productId,
      productName: item.productName,
      categoryName: item.categoryName,
      subcategoryName: item.subcategoryName,
      priceCents: toCents(item.unitPrice) - extrasCents,
      quantity: item.quantity,
      note: item.note ?? "",
      extras: item.extras.map((extra) => ({
        extraId: extra.extraId,
        name: extra.name,
        priceCents: toCents(extra.price),
        quantity: extra.quantity,
      })),
      notice: null,
      unavailable: false,
    };
  });
}

async function loadEditSession(saleId: string): Promise<EditSession | Sale> {
  const sale = await getSale(saleId);
  if (sale.status !== "Preparing") return sale;

  const [products, extras] = await Promise.all([getAvailableProducts(), getActiveExtras()]);
  return {
    saleId: sale.id,
    saleNumber: saleNumber(sale.id),
    customerDescription: sale.customerDescription ?? "",
    lines: applyCatalogPrices(toCartLines(sale), { products, extras }),
  };
}

function CatalogEmpty({ description }: { description: string }) {
  return <EmptyState description={description} className="rounded-md border border-border-translucent bg-card" />;
}

async function PosCatalog({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(["Admin", "Cashier"]);
  const raw = await searchParams;
  const search = firstValue(raw.search)?.trim().slice(0, 100) || null;
  const categories = await getActiveCategories();

  if (categories.length === 0) {
    return <CatalogEmpty description="No hay categorías activas. Un administrador debe crearlas en Catálogo." />;
  }

  const category = categories.find((item) => item.id === firstValue(raw.category)) ?? categories[0];
  const subcategory =
    category.subcategories.find((item) => item.id === firstValue(raw.subcategory)) ?? category.subcategories[0] ?? null;

  const products = search
    ? await getAvailableProducts({ search })
    : subcategory
      ? await getAvailableProducts({ categoryId: category.id, subcategoryId: subcategory.id })
      : [];

  return (
    <>
      <PosCatalogNav categories={categories} categoryId={category.id} subcategoryId={subcategory?.id ?? null} />
      <section aria-label={search ? `Resultados para ${search}` : "Productos"} className="flex flex-col gap-3">
        {search && (
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Resultados para «{search}»
          </h2>
        )}
        {products.length > 0 ? (
          <ProductGrid products={products} showSubcategory={Boolean(search)} />
        ) : (
          <CatalogEmpty
            description={
              search
                ? "No encontramos productos con ese nombre."
                : subcategory
                  ? "Esta subcategoría no tiene productos disponibles."
                  : "Esta categoría no tiene subcategorías disponibles."
            }
          />
        )}
      </section>
    </>
  );
}

async function PosEditSession({ searchParams }: { searchParams: SearchParams }) {
  const editId = EntityIdSchema.safeParse(firstValue((await searchParams).edit));
  if (!editId.success) return null;

  await requireRole(["Admin", "Cashier"]);
  const result = await loadEditSession(editId.data);
  if ("saleNumber" in result) return <EditSessionLoader session={result} />;

  return (
    <Alert variant="warning">
      <TriangleAlertIcon />
      <AlertTitle>La venta {saleNumber(result.id)} ya no se puede modificar.</AlertTitle>
      <AlertDescription>Solo se pueden modificar ventas en preparación.</AlertDescription>
      <AlertAction>
        <Button asChild variant="outline" size="sm">
          <Link href={`/sales/${result.id}`}>Ver la venta</Link>
        </Button>
      </AlertAction>
    </Alert>
  );
}

async function PosCart() {
  await requireRole(["Admin", "Cashier"]);
  const extras = await getActiveExtras();
  return (
    <aside
      aria-label="Pedido"
      className="sticky top-20 hidden h-[calc(100dvh-6rem)] overflow-hidden rounded-md border border-border-translucent bg-card lg:block"
    >
      <CartPanel extras={extras} />
    </aside>
  );
}

async function PosMobileCart() {
  await requireRole(["Admin", "Cashier"]);
  const extras = await getActiveExtras();
  return <MobileCartBar extras={extras} />;
}

function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando catálogo">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-24" />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
    </div>
  );
}

export default function PosPage({ searchParams }: PageProps<"/pos">) {
  return (
    <div className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex min-h-[calc(100dvh-9.75rem)] min-w-0 flex-col gap-4 lg:min-h-0">
        <h1 className="sr-only">Punto de venta</h1>
        <Suspense>
          <PosEditSession searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<CatalogSkeleton />}>
          <PosCatalog searchParams={searchParams} />
        </Suspense>
        <div className="contents lg:hidden">
          <Suspense>
            <PosMobileCart />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="hidden h-[calc(100dvh-6rem)] lg:block" />}>
        <PosCart />
      </Suspense>
    </div>
  );
}
