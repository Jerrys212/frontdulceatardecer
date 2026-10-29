"use client";

import { useEffect, useState, useTransition } from "react";
import { LogOutIcon, MonitorSmartphoneIcon } from "lucide-react";
import { toast } from "sonner";

import { getUserSessions, revokeUserSessions } from "@/actions/users/user-actions";
import { EmptyState } from "@/components/empty-state";
import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { Session, User } from "@/data/users/types";
import { formatDateTime } from "@/lib/formats";
import { toastFailure } from "@/lib/toast-failure";
import type { ActionFailure } from "@/types/api";

type SessionsState =
  | { status: "loading" }
  | { status: "ready"; sessions: Session[] }
  | { status: "error"; failure: ActionFailure };

type UserSessionsDialogProps = {
  user: Pick<User, "id" | "fullName">;
  isSelf: boolean;
  onClose: () => void;
};

export function UserSessionsDialog({ user, isSelf, onClose }: UserSessionsDialogProps) {
  const [state, setState] = useState<SessionsState>({ status: "loading" });
  const [confirming, setConfirming] = useState(false);
  const [isRevoking, startRevoke] = useTransition();

  useEffect(() => {
    let ignore = false;
    getUserSessions(user.id).then((result) => {
      if (ignore) return;
      setState(result.success ? { status: "ready", sessions: result.data } : { status: "error", failure: result });
    });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  function revokeAll() {
    startRevoke(async () => {
      const result = await revokeUserSessions(user.id);
      if (!result.success) {
        toastFailure(result);
        return;
      }
      toast.success(result.message);
      setState({ status: "ready", sessions: [] });
      setConfirming(false);
    });
  }

  const sessionCount = state.status === "ready" ? state.sessions.length : 0;

  return (
    <Dialog open onOpenChange={(open) => !open && !isRevoking && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sesiones activas</DialogTitle>
          <DialogDescription>Dispositivos donde {user.fullName} tiene la sesión abierta.</DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando sesiones">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {state.status === "error" && <FormErrorAlert failure={state.failure} />}
        {state.status === "ready" &&
          (state.sessions.length === 0 ? (
            <EmptyState description="No tiene sesiones activas." className="rounded-md bg-muted p-4" />
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {state.sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-start gap-3 rounded-md border border-border-translucent px-3 py-2.5"
                >
                  <MonitorSmartphoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium" title={session.userAgent ?? undefined}>
                      {session.userAgent ?? "Dispositivo desconocido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inició {formatDateTime(session.createdAt)} · Vence {formatDateTime(session.expiresAt)}
                      {session.ipAddress && ` · IP ${session.ipAddress}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        <DialogFooter className="sm:justify-between">
          {confirming ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {isSelf ? "También se cerrará tu sesión actual." : `¿Cerrar las ${sessionCount} sesiones?`}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={isRevoking} onClick={() => setConfirming(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={revokeAll} disabled={isRevoking}>
                  {isRevoking && <Spinner data-icon="inline-start" />}
                  {isRevoking ? "Cerrando…" : "Sí, cerrar todas"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="danger-outline"
                disabled={sessionCount === 0}
                onClick={() => setConfirming(true)}
              >
                <LogOutIcon data-icon="inline-start" />
                Cerrar todas las sesiones
              </Button>
              <Button onClick={onClose}>Listo</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
