type ErrorContext = Record<string, unknown>;

export function reportError(error: unknown, context: ErrorContext = {}) {
  console.error("[error]", { ...context, error });
}
