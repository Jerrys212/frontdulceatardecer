import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "cn";

import type { SalesSummary } from "@/data/reports/types";
import { formatCurrency, formatIsoDate, formatNumber, formatPercent } from "@/lib/formats";

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-xs text-muted-foreground">Sin datos previos</span>;
  }
  const Icon = change > 0 ? TrendingUpIcon : change < 0 ? TrendingDownIcon : MinusIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        change > 0 && "text-success",
        change < 0 && "text-danger",
        change === 0 && "text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {change > 0 ? "+" : ""}
      {formatPercent(change)}
    </span>
  );
}

type TileProps = {
  label: string;
  value: string;
  change?: number | null;
  detail?: string;
  tone?: "danger";
};

function Tile({ label, value, change, detail, tone }: TileProps) {
  return (
    <li className="flex flex-col gap-1 rounded-md border border-border-translucent bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-2xl font-semibold tabular-nums", tone === "danger" && "text-danger")}>{value}</span>
      {change !== undefined && <ChangeIndicator change={change} />}
      {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
    </li>
  );
}

export function SummaryTiles({ summary }: { summary: SalesSummary }) {
  const { previous } = summary;
  const previousRange =
    previous.from === previous.to
      ? formatIsoDate(previous.from)
      : `${formatIsoDate(previous.from)} – ${formatIsoDate(previous.to)}`;

  return (
    <section aria-label="Resumen del periodo" className="flex flex-col gap-2">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Ingresos" value={formatCurrency(summary.revenue)} change={previous.revenueChangePercentage} />
        <Tile
          label="Ventas cobradas"
          value={formatNumber(summary.salesCount)}
          change={previous.salesCountChangePercentage}
        />
        <Tile
          label="Ticket promedio"
          value={formatCurrency(summary.averageTicket)}
          change={previous.averageTicketChangePercentage}
        />
        <Tile
          label="Canceladas"
          value={formatNumber(summary.cancelledCount)}
          detail={`${formatCurrency(summary.cancelledAmount)} en ventas canceladas`}
          tone={summary.cancelledCount > 0 ? "danger" : undefined}
        />
      </ul>
      <p className="text-xs text-muted-foreground">
        {formatNumber(summary.unitsSold)} productos vendidos · Subtotal {formatCurrency(summary.subtotal)} · IVA{" "}
        {formatCurrency(summary.tax)} · Comparado con {previousRange}
      </p>
    </section>
  );
}
