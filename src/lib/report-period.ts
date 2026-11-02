import type { ReportGrouping, ReportPeriod } from "@/data/reports/types";

const DAY_MS = 86_400_000;
const MAX_HOURLY_DAYS = 31;
const MAX_WEEKLY_DAYS = 180;

export type PeriodPreset = "today" | "month" | "year";

export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  today: "Hoy",
  month: "Este mes",
  year: "Este año",
};

function toUtcMs(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function fromUtcMs(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function periodDays({ from, to }: ReportPeriod) {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS) + 1;
}

export function presetPeriod(preset: PeriodPreset, today: string): ReportPeriod {
  if (preset === "month") return { from: `${today.slice(0, 7)}-01`, to: today };
  if (preset === "year") return { from: `${today.slice(0, 4)}-01-01`, to: today };
  return { from: today, to: today };
}

export function matchingPreset(period: ReportPeriod, today: string): PeriodPreset | null {
  const presets: PeriodPreset[] = ["today", "month", "year"];
  return (
    presets.find((preset) => {
      const candidate = presetPeriod(preset, today);
      return candidate.from === period.from && candidate.to === period.to;
    }) ?? null
  );
}

export function resolveReportPeriod(from: string | undefined, to: string | undefined, today: string): ReportPeriod {
  let start = from ?? today;
  let end = to ?? today;
  if (start > end) [start, end] = [end, start];

  const twoYearsAfterStart = new Date(toUtcMs(start));
  twoYearsAfterStart.setUTCFullYear(twoYearsAfterStart.getUTCFullYear() + 2);
  if (toUtcMs(end) >= twoYearsAfterStart.getTime()) {
    const earliest = new Date(toUtcMs(end));
    earliest.setUTCFullYear(earliest.getUTCFullYear() - 2);
    start = fromUtcMs(earliest.getTime() + DAY_MS);
  }

  return { from: start, to: end };
}

export function groupingFor(period: ReportPeriod): ReportGrouping {
  const days = periodDays(period);
  if (days === 1) return "hour";
  if (days <= MAX_HOURLY_DAYS) return "day";
  if (days <= MAX_WEEKLY_DAYS) return "week";
  return "month";
}
