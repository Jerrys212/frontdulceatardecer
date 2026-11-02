import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReportGrouping, SalesInterval } from "@/data/reports/types";
import { NoSalesMessage } from "@/features/reports/components/report-panel";
import { formatCurrency, formatIntervalLabel, formatNumber } from "@/lib/formats";

const MAX_AXIS_LABELS = 8;

export function SalesOverTimeChart({ intervals, grouping }: { intervals: SalesInterval[]; grouping: ReportGrouping }) {
  const max = Math.max(0, ...intervals.map((interval) => interval.revenue));
  if (intervals.length === 0 || max === 0) return <NoSalesMessage />;

  const labelEvery = Math.ceil(intervals.length / MAX_AXIS_LABELS);

  return (
    <figure className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2">
        <div className="flex h-56 flex-col justify-between text-right text-xs text-muted-foreground tabular-nums">
          <span>{formatCurrency(max)}</span>
          <span>{formatCurrency(max / 2)}</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="relative h-56 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            <span className="border-t border-dashed border-border" />
            <span className="border-t border-dashed border-border" />
            <span className="border-t border-border" />
          </div>
          <ol className="relative flex h-full items-end gap-0.5">
            {intervals.map((interval) => {
              const label = formatIntervalLabel(interval.start, grouping);
              return (
                <li key={interval.start} className="flex h-full min-w-0 flex-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        tabIndex={0}
                        aria-label={`${label}: ${formatCurrency(interval.revenue)}, ${interval.salesCount} ventas`}
                        className="group flex h-full w-full items-end rounded-sm outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span
                          className="w-full rounded-t-sm bg-primary transition-opacity group-hover:opacity-80"
                          style={{ height: `${(interval.revenue / max) * 100}%` }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex-col items-start gap-0.5">
                      <span className="font-medium">{label}</span>
                      <span className="tabular-nums">{formatCurrency(interval.revenue)}</span>
                      <span className="tabular-nums">
                        {formatNumber(interval.salesCount)} ventas · ticket {formatCurrency(interval.averageTicket)}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ol>
        </div>
      <div className="col-start-2 flex gap-0.5 text-xs text-muted-foreground" aria-hidden="true">
        {intervals.map((interval, index) => (
          <span key={interval.start} className="min-w-0 flex-1 overflow-visible text-center whitespace-nowrap">
            {index % labelEvery === 0 ? formatIntervalLabel(interval.start, grouping) : ""}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">Ingresos por periodo; pasa el cursor o enfoca cada barra para ver el detalle.</figcaption>
    </figure>
  );
}
