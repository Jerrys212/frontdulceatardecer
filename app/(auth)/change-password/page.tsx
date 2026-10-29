import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ShieldAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/data/auth/get-current-user";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getHomePath } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Cambiar contraseña",
};

async function ChangePasswordContent() {
  const user = await getCurrentUser();
  const homePath = getHomePath(user.role);

  return (
    <>
      {user.mustChangePassword && (
        <Alert className="border-warning/50 text-foreground">
          <ShieldAlertIcon className="text-warning" />
          <AlertTitle>Necesitas una contraseña nueva</AlertTitle>
          <AlertDescription>
            Estás usando una contraseña temporal. Cámbiala para poder usar el sistema.
          </AlertDescription>
        </Alert>
      )}
      <Card className="rounded-md border border-border-translucent shadow-none ring-0">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Cambia tu contraseña</CardTitle>
          <CardDescription>
            Hola, {user.fullName}. Al cambiarla se cerrarán tus otras sesiones abiertas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm redirectTo={homePath} />
        </CardContent>
      </Card>
      <nav aria-label="Opciones de sesión" className="flex justify-center">
        {user.mustChangePassword ? (
          <LogoutButton />
        ) : (
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href={homePath}>
              <ArrowLeftIcon />
              Volver al inicio
            </Link>
          </Button>
        )}
      </nav>
    </>
  );
}

function ChangePasswordSkeleton() {
  return <div className="h-96 animate-pulse rounded-md bg-card" aria-busy="true" aria-label="Cargando" />;
}

export default function ChangePasswordPage() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<ChangePasswordSkeleton />}>
        <ChangePasswordContent />
      </Suspense>
    </div>
  );
}
