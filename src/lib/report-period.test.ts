import { describe, expect, it } from "vitest";

import { groupingFor, matchingPreset, periodDays, presetPeriod, resolveReportPeriod } from "@/lib/report-period";

const TODAY = "2026-11-02";

describe("resolveReportPeriod", () => {
  it("defaults to today", () => {
    expect(resolveReportPeriod(undefined, undefined, TODAY)).toEqual({ from: TODAY, to: TODAY });
  });

  it("swaps inverted dates", () => {
    expect(resolveReportPeriod("2026-10-10", "2026-10-01", TODAY)).toEqual({ from: "2026-10-01", to: "2026-10-10" });
  });

  it("clamps periods of two years or more", () => {
    const period = resolveReportPeriod("2024-01-01", "2026-01-01", TODAY);
    expect(period).toEqual({ from: "2024-01-02", to: "2026-01-01" });
  });
});

describe("presets", () => {
  it("builds month and year from today", () => {
    expect(presetPeriod("month", TODAY)).toEqual({ from: "2026-11-01", to: TODAY });
    expect(presetPeriod("year", TODAY)).toEqual({ from: "2026-01-01", to: TODAY });
  });

  it("recognizes a preset period and ignores custom ones", () => {
    expect(matchingPreset({ from: "2026-11-01", to: TODAY }, TODAY)).toBe("month");
    expect(matchingPreset({ from: "2026-10-15", to: TODAY }, TODAY)).toBeNull();
  });
});

describe("groupingFor", () => {
  it("picks a grouping that keeps the chart readable", () => {
    expect(groupingFor({ from: TODAY, to: TODAY })).toBe("hour");
    expect(groupingFor({ from: "2026-10-01", to: "2026-10-31" })).toBe("day");
    expect(groupingFor({ from: "2026-06-01", to: "2026-10-31" })).toBe("week");
    expect(groupingFor({ from: "2026-01-01", to: "2026-10-31" })).toBe("month");
  });

  it("counts days inclusively", () => {
    expect(periodDays({ from: "2026-10-01", to: "2026-10-31" })).toBe(31);
  });
});
