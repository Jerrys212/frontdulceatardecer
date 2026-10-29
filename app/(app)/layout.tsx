import { Suspense } from "react";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/data/auth/get-current-user";
import { UserMenu } from "@/features/auth/components/user-menu";
import { CHANGE_PASSWORD_PATH } from "@/lib/auth/routes";

async function HeaderUser() {
  const user = await getCurrentUser();
  if (user.mustChangePassword) redirect(CHANGE_PASSWORD_PATH);
  return <UserMenu user={user} />;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
        <BrandLogo className="text-foreground" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Suspense fallback={<div className="size-9 animate-pulse rounded-full bg-muted" />}>
            <HeaderUser />
          </Suspense>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-4 py-6 md:px-6">{children}</main>
      <footer className="flex items-center justify-between border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground md:px-6">
        <span>Dulce Atardecer</span>
        <span>America/Mexico_City</span>
      </footer>
    </>
  );
}
