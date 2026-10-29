import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { reportError } from "@/adapters/error-tracking";
import { ApiError, GENERIC_ERROR_MESSAGE } from "@/data/api-error";
import type { ActionFailure } from "@/types/api";

export function validationFailure(error: z.ZodError): ActionFailure {
  return {
    success: false,
    message: "Hay errores de validación",
    errors: error.issues.map((issue) => issue.message),
  };
}

export function toActionFailure(error: unknown, action: string): ActionFailure {
  unstable_rethrow(error);
  if (error instanceof ApiError) {
    return { success: false, message: error.message, errors: error.errors };
  }
  reportError(error, { scope: action });
  return { success: false, message: GENERIC_ERROR_MESSAGE, errors: [GENERIC_ERROR_MESSAGE] };
}
