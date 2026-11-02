import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ExtraSales, ProductSales } from "@/data/reports/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formats";

function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  );
}

function ShareCell({ percentage }: { percentage: number }) {
  return (
    <TableCell className="pr-4">
      <span className="flex items-center justify-end gap-2">
        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block" aria-hidden="true">
          <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, percentage)}%` }} />
        </span>
        <span className="w-14 text-right tabular-nums">{formatPercent(percentage)}</span>
      </span>
    </TableCell>
  );
}

export function ProductsRankingTable({ products, emptyMessage }: { products: ProductSales[]; emptyMessage: string }) {
  return (
    <div className="-mx-4 -mb-4 overflow-hidden border-t border-border">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="pl-4">Producto</TableHead>
            <TableHead className="text-right">Unidades</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead className="pr-4 text-right">% ingresos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <EmptyRow colSpan={4}>{emptyMessage}</EmptyRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="pl-4 whitespace-normal">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.categoryName} · {product.subcategoryName}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(product.units)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(product.revenue)}</TableCell>
                <ShareCell percentage={product.revenuePercentage} />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function ExtrasRankingTable({ extras }: { extras: ExtraSales[] }) {
  return (
    <div className="-mx-4 -mb-4 overflow-hidden border-t border-border">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="pl-4">Extra</TableHead>
            <TableHead className="text-right">Veces</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead className="pr-4 text-right">% de ventas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extras.length === 0 ? (
            <EmptyRow colSpan={4}>Ningún extra vendido en este periodo.</EmptyRow>
          ) : (
            extras.map((extra) => (
              <TableRow key={extra.extraId}>
                <TableCell className="pl-4 font-medium">{extra.name}</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(extra.timesSold)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {extra.revenue === 0 ? <Badge variant="success-subtle">Gratis</Badge> : formatCurrency(extra.revenue)}
                </TableCell>
                <ShareCell percentage={extra.salesPercentage} />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
