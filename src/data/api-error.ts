export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly errors: string[],
    readonly data: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }

  hasMessage(text: string) {
    return this.message === text || this.errors.includes(text);
  }
}

export const GENERIC_ERROR_MESSAGE = "Ocurrió un error inesperado, intenta de nuevo";

const FALLBACK_MESSAGES: Record<number, string> = {
  429: "Demasiadas solicitudes, intenta más tarde",
  502: "Recibimos una respuesta inesperada del servidor",
  503: "No pudimos conectar con el servidor",
};

export function fallbackMessage(statusCode: number) {
  return FALLBACK_MESSAGES[statusCode] ?? GENERIC_ERROR_MESSAGE;
}
