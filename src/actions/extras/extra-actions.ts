"use server";

import { refresh } from "next/cache";

import { ExtraFormSchema, type ExtraFormInput } from "@/actions/extras/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { EmptyDataSchema } from "@/data/auth/types";
import { apiFetch } from "@/data/client";
import { ExtraSchema } from "@/data/extras/types";
import { EntityIdSchema } from "@/lib/validations/ids";
import type { ActionResult } from "@/types/api";

export async function createExtra(input: ExtraFormInput): Promise<ActionResult> {
  const parsed = ExtraFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch("/extras", ExtraSchema, { method: "POST", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Extra creado", data: null };
  } catch (error) {
    return toActionFailure(error, "createExtra");
  }
}

export async function updateExtra(extraId: string, input: ExtraFormInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(extraId);
  if (!id.success) return validationFailure(id.error);
  const parsed = ExtraFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/extras/${id.data}`, ExtraSchema, { method: "PUT", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Extra actualizado", data: null };
  } catch (error) {
    return toActionFailure(error, "updateExtra");
  }
}

export async function setExtraActive(extraId: string, active: boolean): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(extraId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { message } = await apiFetch(`/extras/${id.data}/${active ? "activate" : "deactivate"}`, EmptyDataSchema, {
      method: "POST",
    });
    refresh();
    return { success: true, message: message ?? (active ? "Extra activado" : "Extra desactivado"), data: null };
  } catch (error) {
    return toActionFailure(error, "setExtraActive");
  }
}
