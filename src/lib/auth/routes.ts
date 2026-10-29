import type { Role } from "@/data/auth/types";

export const LOGIN_PATH = "/login";
export const CHANGE_PASSWORD_PATH = "/change-password";
export const SIGN_OUT_PATH = "/auth/signout";

export const PUBLIC_PATHS = [LOGIN_PATH];

export const MUST_CHANGE_PASSWORD_MESSAGE = "Debes cambiar tu contraseña antes de continuar";

export const ROLE_LABELS: Record<Role, string> = {
  Admin: "Administrador",
  Cashier: "Cajero",
  Kitchen: "Cocina",
};

const ROLE_HOME: Record<Role, string> = {
  Admin: "/",
  Cashier: "/",
  Kitchen: "/",
};

export function getHomePath(role: Role) {
  return ROLE_HOME[role];
}

export const SIGN_OUT_REASONS = {
  expired: "Tu sesión terminó. Inicia sesión de nuevo para continuar.",
  unavailable: "No pudimos conectar con el servidor. Intenta de nuevo en un momento.",
} as const;

export type SignOutReason = keyof typeof SIGN_OUT_REASONS;
