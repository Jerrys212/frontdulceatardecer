"use client";

import { ClockIcon } from "lucide-react";
import { cn } from "cn";

import { useNow } from "@/hooks/use-now";
import { elapsedMinutes, formatDateTime, formatElapsed } from "@/lib/formats";

const LATE_AFTER_MINUTES = 20;

export function ElapsedTime({ since, className }: { since: string; className?: string }) {
  const now = useNow(30_000);
  const late = elapsedMinutes(since, now) >= LATE_AFTER_MINUTES;

  return (
    <time
      dateTime={since}
      title={formatDateTime(since)}
      suppressHydrationWarning
      className={cn("flex items-center gap-1 text-xs font-medium whitespace-nowrap", late ? "text-danger" : "text-muted-foreground", className)}
    >
      <ClockIcon className="size-3.5" aria-hidden="true" />
      {formatElapsed(since, now)}
    </time>
  );
}
