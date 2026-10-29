"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";

export function AutoRefresh({ intervalMs }: { intervalMs: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefresh, setLastRefresh] = useState(() => Date.now());
  const now = useNow(1_000);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      startTransition(() => router.refresh());
      setLastRefresh(Date.now());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, router]);

  function refreshNow() {
    startTransition(() => router.refresh());
    setLastRefresh(Date.now());
  }

  const seconds = Math.max(0, Math.floor((now - lastRefresh) / 1000));

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5" suppressHydrationWarning>
        <span className={cn("size-2 rounded-full", isPending ? "animate-pulse bg-info" : "bg-success")} aria-hidden="true" />
        Actualizado hace {seconds} s
      </span>
      <Button variant="outline" size="sm" disabled={isPending} onClick={refreshNow}>
        <RefreshCwIcon data-icon="inline-start" className={cn(isPending && "animate-spin")} />
        Actualizar
      </Button>
    </div>
  );
}
