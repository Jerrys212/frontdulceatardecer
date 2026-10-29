import { Suspense } from "react";
import type { Metadata } from "next";
import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { SIGN_OUT_REASONS, type SignOutReason } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Inicia sesión",
};

function isSignOutReason(value: unknown): value is SignOutReason {
  return typeof value === "string" && value in SIGN_OUT_REASONS;
}

async function SignOutNotice({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { reason } = await searchParams;
  if (!isSignOutReason(reason)) return null;

  return (
    <Alert variant="info">
      <InfoIcon />
      <AlertDescription>{SIGN_OUT_REASONS[reason]}</AlertDescription>
    </Alert>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <SignOutNotice searchParams={searchParams} />
      </Suspense>
      <Card className="rounded-md border border-border-translucent shadow-none ring-0">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Inicia sesión</CardTitle>
          <CardDescription>Punto de venta Dulce Atardecer</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        ¿Olvidaste tu contraseña? Pídele al administrador que la restablezca.
      </p>
    </div>
  );
}
