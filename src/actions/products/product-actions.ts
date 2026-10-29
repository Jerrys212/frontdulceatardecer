"use server";

import { refresh } from "next/cache";

import { ProductFormSchema, type ProductFormInput } from "@/actions/products/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { EmptyDataSchema } from "@/data/auth/types";
import { apiFetch } from "@/data/client";
import { ProductSchema } from "@/data/products/types";
import { EntityIdSchema } from "@/lib/validations/ids";
import type { ActionResult } from "@/types/api";

export async function createProduct(input: ProductFormInput): Promise<ActionResult> {
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch("/products", ProductSchema, { method: "POST", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Producto creado", data: null };
  } catch (error) {
    return toActionFailure(error, "createProduct");
  }
}

export async function updateProduct(productId: string, input: ProductFormInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(productId);
  if (!id.success) return validationFailure(id.error);
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/products/${id.data}`, ProductSchema, { method: "PUT", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Producto actualizado", data: null };
  } catch (error) {
    return toActionFailure(error, "updateProduct");
  }
}

export async function setProductActive(productId: string, active: boolean): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(productId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { message } = await apiFetch(`/products/${id.data}/${active ? "activate" : "deactivate"}`, EmptyDataSchema, {
      method: "POST",
    });
    refresh();
    return { success: true, message: message ?? (active ? "Producto activado" : "Producto desactivado"), data: null };
  } catch (error) {
    return toActionFailure(error, "setProductActive");
  }
}
