import { cn } from "cn";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DAY_OF_WEEK_LABELS, DayOfWeekSchema, type HeatmapCell } from "@/data/reports/types";
import { NoSalesMessage } from "@/features/reports/components/report-panel";
import { formatCurrency, formatNumber } from "@/lib/formats";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const INTENSITY_CLASSES = ["bg-muted", "bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"];

function intensity(count: number, max: number) {
  if (count === 0 || max === 0) return 0;
  return Math.max(1, Math.ceil((count / max) * (INTENSITY_CLASSES.length - 1)));
}

function hourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function SalesHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(0, ...cells.map((cell) => cell.salesCount));
  if (max === 0) return <NoSalesMessage />;

  const byKey = new Map(cells.map((cell) => [`${cell.dayOfWeek}-${cell.hour}`, cell]));

  return (
    <figure className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th scope="col" className="w-10">
                <span className="sr-only">Día</span>
              </th>
              {HOURS.map((hour) => (
                <th key={hour} scope="col" className="font-normal text-muted-foreground">
                  {hour % 3 === 0 ? hour : <span className="sr-only">{hour}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DayOfWeekSchema.options.map((day) => (
              <tr key={day}>
                <th scope="row" className="pr-1 text-left font-normal text-muted-foreground">
                  {DAY_OF_WEEK_LABELS[day]}
                </th>
                {HOURS.map((hour) => {
                  const cell = byKey.get(`${day}-${hour}`);
                  const count = cell?.salesCount ?? 0;
                  const description = `${DAY_OF_WEEK_LABELS[day]} ${hourLabel(hour)}: ${count} ventas, ${formatCurrency(cell?.revenue ?? 0)}`;
                  return (
                    <td key={hour} className="p-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            tabIndex={0}
                            aria-label={description}
                            className={cn(
                              "h-6 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                              INTENSITY_CLASSES[intensity(count, max)],
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="flex-col items-start gap-0.5">
                          <span className="font-medium">
                            {DAY_OF_WEEK_LABELS[day]} · {hourLabel(hour)}
                          </span>
                          <span className="tabular-nums">
                            {formatNumber(count)} ventas · {formatCurrency(cell?.revenue ?? 0)}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Menos</span>
        <span className="flex gap-0.5" aria-hidden="true">
          {INTENSITY_CLASSES.map((className) => (
            <span key={className} className={cn("size-3 rounded-sm", className)} />
          ))}
        </span>
        <span>Más ventas</span>
      </figcaption>
    </figure>
  );
}
