import { z } from "zod";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const EntityIdSchema = z.string().regex(UUID_PATTERN, "El registro no es válido");

export function selectedIdSchema(requiredMessage: string) {
  return z.string().min(1, { error: requiredMessage, abort: true }).regex(UUID_PATTERN, "La opción elegida no es válida");
}
