"use client";

import { useTransition } from "react";
import Link from "next/link";
import { KeyRoundIcon, LogOutIcon } from "lucide-react";

import { logout } from "@/actions/auth/logout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/data/auth/types";
import { CHANGE_PASSWORD_PATH, ROLE_LABELS } from "@/lib/auth/routes";
import { getInitials } from "@/lib/formats";


type UserMenuProps = {
  user: Pick<CurrentUser, "fullName" | "username" | "role">;
};

export function UserMenu({ user }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`Menú de ${user.fullName}`}
      >
        <Avatar className="size-9">
          <AvatarFallback className="bg-steel text-xs font-semibold text-primary-foreground">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-dropdown">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">{user.fullName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            @{user.username} · {ROLE_LABELS[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={CHANGE_PASSWORD_PATH}>
            <KeyRoundIcon />
            Cambiar contraseña
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onSelect={() => startTransition(() => logout())}
        >
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
