import { cn } from "cn";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusFilterSchema, type StatusFilter } from "@/lib/validations/status";

type StatusSelectProps = {
  value: string;
  onChange: (value: StatusFilter) => void;
  feminine?: boolean;
  className?: string;
};

export function StatusSelect({ value, onChange, feminine = false, className }: StatusSelectProps) {
  const ending = feminine ? "as" : "os";
  return (
    <Select
      value={StatusFilterSchema.catch("all").parse(value)}
      onValueChange={(next) => onChange(StatusFilterSchema.catch("all").parse(next))}
    >
      <SelectTrigger className={cn("h-9 w-full bg-card sm:w-40", className)} aria-label="Filtrar por estado">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">Estado: tod{ending}</SelectItem>
          <SelectItem value="active">Activ{ending}</SelectItem>
          <SelectItem value="inactive">Inactiv{ending}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
