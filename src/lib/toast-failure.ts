import { toast } from "sonner";

import type { ActionFailure } from "@/types/api";

export function toastFailure({ message, errors }: Pick<ActionFailure, "message" | "errors">, fallbackDescription?: string) {
  const details = errors.filter((error) => error !== message).join(" ");
  toast.error(message, { description: details || fallbackDescription });
}
