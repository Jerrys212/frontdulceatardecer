"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/types/api";

type ActiveSwitchProps = {
  checked: boolean;
  label: string;
  deactivateTitle: string;
  deactivateDescription: string;
  onToggle: (active: boolean) => Promise<ActionResult>;
};

export function ActiveSwitch({ checked, label, deactivateTitle, deactivateDescription, onToggle }: ActiveSwitchProps) {
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(checked);
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  async function toggle(active: boolean) {
    setOptimisticChecked(active);
    const result = await onToggle(active);
    if (result.success) toast.success(result.message);
    else toast.error(result.message, { description: result.errors.filter((error) => error !== result.message).join(" ") });
  }

  return (
    <>
      <Switch
        checked={optimisticChecked}
        disabled={isPending}
        aria-label={label}
        onCheckedChange={(active) => {
          if (active) startTransition(() => toggle(true));
          else setConfirming(true);
        }}
      />
      {confirming && (
        <ConfirmDialog
          title={deactivateTitle}
          description={deactivateDescription}
          confirmLabel="Desactivar"
          pendingLabel="Desactivando…"
          destructive
          onConfirm={async () => {
            setConfirming(false);
            startTransition(() => toggle(false));
          }}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
}
