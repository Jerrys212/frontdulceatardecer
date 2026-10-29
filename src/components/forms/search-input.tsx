import { SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

type SearchInputProps = {
  value: string;
  label: string;
  onChange: (value: string) => void;
  pending?: boolean;
  className?: string;
};

export function SearchInput({ value, label, onChange, pending = false, className }: SearchInputProps) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon>{pending ? <Spinner /> : <SearchIcon />}</InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        maxLength={100}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        aria-label={label}
      />
    </InputGroup>
  );
}
