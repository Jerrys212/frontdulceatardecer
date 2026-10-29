import { NotebookPenIcon } from "lucide-react";
import { cn } from "cn";

export function SaleNote({ note, className }: { note: string; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1 text-xs text-warning italic", className)}>
      <NotebookPenIcon className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      {note}
    </p>
  );
}
