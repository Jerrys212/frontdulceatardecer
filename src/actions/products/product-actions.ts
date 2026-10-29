"use server";

import { activationPath, runMutation, validationFailure } from "@/actions/action-result";
import { ProductFormSchema, type ProductFormInput } from "@/actions/products/schemas";
import { apiFetch } from "@/data/client";
import { ProductSchema } from "@/data/products/types";
import { EntityIdSchema } from "@/lib/validations/ids";
import { EmptyDataSchema, type ActionResult } from "@/types/api";

export async function createProduct(input: ProductFormInput): Promise<ActionResult> {
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("createProduct", "Producto creado", () =>
    apiFetch("/products", ProductSchema, { method: "POST", body: parsed.data }),
  );
}

export async function updateProduct(productId: string, input: ProductFormInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(productId);
  if (!id.success) return validationFailure(id.error);
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("updateProduct", "Producto actualizado", () =>
    apiFetch(`/products/${id.data}`, ProductSchema, { method: "PUT", body: parsed.data }),
  );
}

export async function setProductActive(productId: string, active: boolean): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(productId);
  if (!id.success) return validationFailure(id.error);

  return runMutation("setProductActive", active ? "Producto activado" : "Producto desactivado", () =>
    apiFetch(activationPath(`/products/${id.data}`, active), EmptyDataSchema, { method: "POST" }),
  );
}
