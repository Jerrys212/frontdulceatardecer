"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ReportPeriod } from "@/data/reports/types";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { matchingPreset, PERIOD_PRESET_LABELS, presetPeriod, type PeriodPreset } from "@/lib/report-period";

const PRESETS = Object.keys(PERIOD_PRESET_LABELS) as PeriodPreset[];

export function PeriodFilter({ period, today }: { period: ReportPeriod; today: string }) {
  const { isPending, setParams } = useUrlFilters();
  const preset = matchingPreset(period, today);

  function applyPeriod(next: ReportPeriod) {
    setParams({
      from: next.from === today ? null : next.from,
      to: next.to === today ? null : next.to,
      cancellationsPage: null,
    });
  }

  return (
    <search className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" aria-busy={isPending}>
      <ToggleGroup
        type="single"
        variant="outline"
        value={preset ?? ""}
        onValueChange={(value) => {
          if (value) applyPeriod(presetPeriod(value as PeriodPreset, today));
        }}
        aria-label="Periodo rápido"
        className="bg-card"
      >
        {PRESETS.map((key) => (
          <ToggleGroupItem key={key} value={key} className="h-9 px-3">
            {PERIOD_PRESET_LABELS[key]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-from" className="text-xs text-muted-foreground">
            Desde
          </Label>
          <Input
            id="report-from"
            type="date"
            value={period.from}
            max={period.to}
            onChange={(event) => {
              if (event.target.value) applyPeriod({ from: event.target.value, to: period.to });
            }}
            className="h-9 bg-card"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-to" className="text-xs text-muted-foreground">
            Hasta
          </Label>
          <Input
            id="report-to"
            type="date"
            value={period.to}
            min={period.from}
            max={today}
            onChange={(event) => {
              if (event.target.value) applyPeriod({ from: period.from, to: event.target.value });
            }}
            className="h-9 bg-card"
          />
        </div>
      </div>
    </search>
  );
}
