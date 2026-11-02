import { cn } from "cn";

import { formatPercent } from "@/lib/formats";

export type ShareBarItem = {
  key: string;
  label: string;
  value: string;
  detail?: string;
  percentage: number;
  children?: ShareBarItem[];
};

function ShareBar({ item, nested = false }: { item: ShareBarItem; nested?: boolean }) {
  return (
    <li className="flex flex-col gap-1">
      <div className={cn("flex items-baseline justify-between gap-3 text-sm", nested && "text-xs text-muted-foreground")}>
        <span className={cn("min-w-0 truncate", !nested && "font-medium")}>{item.label}</span>
        <span className="shrink-0 tabular-nums">
          {item.value}
          <span className="ml-2 text-muted-foreground">{formatPercent(item.percentage)}</span>
        </span>
      </div>
      <div className={cn("overflow-hidden rounded-full bg-muted", nested ? "h-1" : "h-2")} aria-hidden="true">
        <div
          className={cn("h-full rounded-full", nested ? "bg-primary/50" : "bg-primary")}
          style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
        />
      </div>
      {item.detail && <span className="text-xs text-muted-foreground">{item.detail}</span>}
      {item.children && item.children.length > 0 && (
        <ul className="mt-1 flex flex-col gap-2 border-l border-border pl-3">
          {item.children.map((child) => (
            <ShareBar key={child.key} item={child} nested />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ShareBars({ items }: { items: ShareBarItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <ShareBar key={item.key} item={item} />
      ))}
    </ul>
  );
}
