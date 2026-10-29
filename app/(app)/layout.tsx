import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/data/auth/get-current-user";
import { UserMenu } from "@/features/auth/components/user-menu";
import { CHANGE_PASSWORD_PATH } from "@/lib/auth/routes";

async function HeaderUser() {
  const user = await getCurrentUser();
  if (user.mustChangePassword) redirect(CHANGE_PASSWORD_PATH);
  return (
    <>
      {user.role !== "Kitchen" && (
        <Button asChild size="sm">
          <Link href="/pos">
            <PlusIcon />
            <span className="hidden sm:inline">Nueva venta</span>
            <span className="sr-only sm:hidden">Nueva venta</span>
          </Link>
        </Button>
      )}
      <UserMenu user={user} />
    </>
  );
}

async function SidebarNavigation() {
  const user = await getCurrentUser();
  return <AppSidebarNav role={user.role} />;
}

function SidebarNavigationSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <SidebarMenuSkeleton key={index} showIcon />
      ))}
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar className="border-none">
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
            <Link href="/" className="text-sidebar-foreground-active">
              <BrandLogo />
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <Suspense fallback={<SidebarNavigationSkeleton />}>
              <SidebarNavigation />
            </Suspense>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
            <SidebarTrigger className="text-muted-foreground" aria-label="Mostrar u ocultar menú" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Suspense fallback={<div className="size-9 animate-pulse rounded-full bg-muted" />}>
                <HeaderUser />
              </Suspense>
            </div>
          </header>
          <main className="flex flex-1 flex-col px-4 py-6 md:px-6">{children}</main>
          <footer className="flex items-center justify-between border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground md:px-6">
            <span>Dulce Atardecer © 2026</span>
            <span>America/Mexico_City</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
