"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

type QuantityStepperProps = {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  className?: string;
};

export function QuantityStepper({ value, min, max, label, onChange, className }: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex h-9 items-center rounded-md border border-input bg-card", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-full rounded-r-none"
        aria-label={`Quitar uno: ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <MinusIcon />
      </Button>
      <output aria-live="polite" className="w-9 text-center text-sm font-medium tabular-nums">
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-full rounded-l-none"
        aria-label={`Agregar uno: ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
