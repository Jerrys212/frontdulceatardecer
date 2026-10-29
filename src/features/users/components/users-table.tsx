"use client";

import { useState } from "react";
import {
  EllipsisIcon,
  KeyRoundIcon,
  MonitorSmartphoneIcon,
  PencilIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { deactivateUser, reactivateUser, resetUserPassword } from "@/actions/users/user-account-actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User } from "@/data/users/types";
import { EditUserDialog } from "@/features/users/components/edit-user-dialog";
import { RoleBadge } from "@/features/users/components/role-badge";
import { TemporaryPasswordDialog, type TemporaryPassword } from "@/features/users/components/temporary-password-dialog";
import { UserSessionsDialog } from "@/features/users/components/user-sessions-dialog";
import { formatDate, getInitials } from "@/lib/formats";
import type { ActionResult } from "@/types/api";

type ConfirmKind = "deactivate" | "reactivate" | "reset";

type DialogState =
  | { type: "edit"; user: User }
  | { type: "sessions"; user: User }
  | { type: "confirm"; kind: ConfirmKind; user: User }
  | null;

const CONFIRM_COPY: Record<
  ConfirmKind,
  { title: (name: string) => string; description: string; confirmLabel: string; pendingLabel: string; destructive: boolean }
> = {
  deactivate: {
    title: (name) => `¿Desactivar a ${name}?`,
    description: "No podrá iniciar sesión y se cerrarán todas sus sesiones. Puedes reactivarlo después.",
    confirmLabel: "Desactivar",
    pendingLabel: "Desactivando…",
    destructive: true,
  },
  reactivate: {
    title: (name) => `¿Reactivar a ${name}?`,
    description: "Se generará una contraseña temporal nueva que deberá cambiar al iniciar sesión.",
    confirmLabel: "Reactivar",
    pendingLabel: "Reactivando…",
    destructive: false,
  },
  reset: {
    title: (name) => `¿Restablecer la contraseña de ${name}?`,
    description: "Se cerrarán todas sus sesiones y se generará una contraseña temporal que deberá cambiar al entrar.",
    confirmLabel: "Restablecer",
    pendingLabel: "Restableciendo…",
    destructive: true,
  },
};


type UsersTableProps = {
  users: User[];
  currentUserId: string;
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<TemporaryPassword | null>(null);
  const closeDialog = () => setDialog(null);

  async function runConfirmedAction(kind: ConfirmKind, user: User) {
    const result: ActionResult<{ temporaryPassword: string } | null> =
      kind === "deactivate"
        ? await deactivateUser(user.id)
        : kind === "reactivate"
          ? await reactivateUser(user.id)
          : await resetUserPassword(user.id);

    if (!result.success) {
      toast.error(result.message, { description: result.errors.filter((error) => error !== result.message).join(" ") });
      return;
    }
    toast.success(result.message);
    closeDialog();
    if (result.data) setTemporaryPassword({ fullName: user.fullName, password: result.data.temporaryPassword });
  }

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="pl-4">Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <TableHead className="hidden md:table-cell">Creado</TableHead>
            <TableHead className="w-14 pr-4">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <TableRow key={user.id} className={cn(!user.isActive && "text-muted-foreground")}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar className={cn(!user.isActive && "opacity-60")}>
                      <AvatarFallback className="bg-steel text-xs font-semibold text-primary-foreground">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                      <AvatarBadge className={user.isActive ? "bg-success" : "bg-subtle-foreground"} />
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="flex flex-wrap items-center gap-1.5 font-medium">
                        {user.fullName}
                        {isSelf && (
                          <Badge variant="outline" className="rounded-sm">
                            Tú
                          </Badge>
                        )}
                        {user.mustChangePassword && user.isActive && (
                          <Badge className="rounded-sm bg-warning text-dark">Debe cambiar contraseña</Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} className={cn(!user.isActive && "opacity-60")} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">{user.isActive ? "Activo" : "Inactivo"}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon-sm" aria-label={`Acciones para ${user.fullName}`}>
                        <EllipsisIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 shadow-dropdown">
                      <DropdownMenuItem onSelect={() => setDialog({ type: "edit", user })}>
                        <PencilIcon />
                        Editar
                      </DropdownMenuItem>
                      {user.isActive && (
                        <>
                          <DropdownMenuItem onSelect={() => setDialog({ type: "sessions", user })}>
                            <MonitorSmartphoneIcon />
                            Ver sesiones
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setDialog({ type: "confirm", kind: "reset", user })}>
                            <KeyRoundIcon />
                            Restablecer contraseña
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isSelf && (
                        <>
                          <DropdownMenuSeparator />
                          {user.isActive ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDialog({ type: "confirm", kind: "deactivate", user })}
                            >
                              <UserXIcon />
                              Desactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => setDialog({ type: "confirm", kind: "reactivate", user })}>
                              <UserCheckIcon />
                              Reactivar
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {dialog?.type === "edit" && (
        <EditUserDialog
          key={dialog.user.id}
          user={dialog.user}
          isSelf={dialog.user.id === currentUserId}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "sessions" && (
        <UserSessionsDialog
          key={dialog.user.id}
          user={dialog.user}
          isSelf={dialog.user.id === currentUserId}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "confirm" && (
        <ConfirmDialog
          title={CONFIRM_COPY[dialog.kind].title(dialog.user.fullName)}
          description={CONFIRM_COPY[dialog.kind].description}
          confirmLabel={CONFIRM_COPY[dialog.kind].confirmLabel}
          pendingLabel={CONFIRM_COPY[dialog.kind].pendingLabel}
          destructive={CONFIRM_COPY[dialog.kind].destructive}
          onConfirm={() => runConfirmedAction(dialog.kind, dialog.user)}
          onClose={closeDialog}
        />
      )}
      <TemporaryPasswordDialog value={temporaryPassword} onClose={() => setTemporaryPassword(null)} />
    </>
  );
}
