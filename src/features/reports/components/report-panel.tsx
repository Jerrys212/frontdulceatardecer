import { cn } from "cn";

type ReportPanelProps = {
  id: string;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

export function ReportPanel({ id, title, description, className, children }: ReportPanelProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("flex min-w-0 flex-col gap-4 rounded-md border border-border-translucent bg-card p-4", className)}
    >
      <header className="flex flex-col gap-0.5">
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  );
}

export function NoSalesMessage({ className }: { className?: string }) {
  return (
    <p className={cn("py-8 text-center text-sm text-muted-foreground", className)}>
      Sin ventas cobradas en este periodo.
    </p>
  );
}
