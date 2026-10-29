import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

type PriceInputProps = Omit<React.ComponentProps<typeof InputGroupInput>, "inputMode"> & {
  groupClassName?: string;
};

export function PriceInput({ groupClassName, ...props }: PriceInputProps) {
  return (
    <InputGroup className={groupClassName}>
      <InputGroupAddon>
        <InputGroupText>$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput inputMode="decimal" placeholder="0.00" autoComplete="off" {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupText>MXN</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
