"use server";

import { activationPath, runMutation, validationFailure } from "@/actions/action-result";
import { ExtraFormSchema, type ExtraFormInput } from "@/actions/extras/schemas";
import { apiFetch } from "@/data/client";
import { ExtraSchema } from "@/data/extras/types";
import { EntityIdSchema } from "@/lib/validations/ids";
import { EmptyDataSchema, type ActionResult } from "@/types/api";

export async function createExtra(input: ExtraFormInput): Promise<ActionResult> {
  const parsed = ExtraFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("createExtra", "Extra creado", () =>
    apiFetch("/extras", ExtraSchema, { method: "POST", body: parsed.data }),
  );
}

export async function updateExtra(extraId: string, input: ExtraFormInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(extraId);
  if (!id.success) return validationFailure(id.error);
  const parsed = ExtraFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("updateExtra", "Extra actualizado", () =>
    apiFetch(`/extras/${id.data}`, ExtraSchema, { method: "PUT", body: parsed.data }),
  );
}

export async function setExtraActive(extraId: string, active: boolean): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(extraId);
  if (!id.success) return validationFailure(id.error);

  return runMutation("setExtraActive", active ? "Extra activado" : "Extra desactivado", () =>
    apiFetch(activationPath(`/extras/${id.data}`, active), EmptyDataSchema, { method: "POST" }),
  );
}
