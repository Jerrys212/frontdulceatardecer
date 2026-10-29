"use client";

import { useTransition } from "react";
import { LogOutIcon } from "lucide-react";

import { logout } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-muted-foreground"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
    >
      <LogOutIcon data-icon="inline-start" />
      {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
