const TIME_ZONE = "America/Mexico_City";
const LOCALE = "es-MX";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "MXN",
  currencyDisplay: "narrowSymbol",
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso));
}

export function elapsedMinutes(fromIso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 60_000));
}

export function formatElapsed(fromIso: string, now: number) {
  const minutes = elapsedMinutes(fromIso, now);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `hace ${hours} h` : `hace ${hours} h ${rest} min`;
}

export function getInitials(fullName: string) {
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayIsoDate() {
  return isoDateFormatter.format(new Date());
}

const numberFormatter = new Intl.NumberFormat(LOCALE);

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

const percentFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

export function formatPercent(value: number) {
  return `${percentFormatter.format(value)} %`;
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS[(month ?? 1) - 1]} ${year}`;
}

export function formatIntervalLabel(start: string, grouping: "hour" | "day" | "week" | "month") {
  const [year, month, day] = start.slice(0, 10).split("-").map(Number);
  const monthLabel = MONTHS[(month ?? 1) - 1];
  if (grouping === "hour") return `${start.slice(11, 13)}:00`;
  if (grouping === "month") return `${monthLabel} ${year}`;
  if (grouping === "week") return `Sem. ${day} ${monthLabel}`;
  return `${day} ${monthLabel}`;
}
