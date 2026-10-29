import { cn } from "cn";

type BrandLogoProps = {
  className?: string;
  showName?: boolean;
};

export function BrandLogo({ className, showName = true }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-8 shrink-0">
        <path d="M8 21a8 8 0 0 1 16 0z" className="fill-brand-sun" />
        <path
          d="M3 21h26M8 25h16M12.5 28.5h7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {showName ? (
        <span className="text-xs font-medium tracking-[0.3em] uppercase">Dulce Atardecer</span>
      ) : (
        <span className="sr-only">Dulce Atardecer</span>
      )}
    </span>
  );
}
