"use server";

import { activationPath, runMutation, validationFailure } from "@/actions/action-result";
import { CreateCategorySchema, NameSchema, type CreateCategoryInput, type NameInput } from "@/actions/categories/schemas";
import { CategorySchema, SubcategorySchema } from "@/data/categories/types";
import { apiFetch } from "@/data/client";
import { EntityIdSchema } from "@/lib/validations/ids";
import { EmptyDataSchema, type ActionResult } from "@/types/api";

export async function createCategory(input: CreateCategoryInput): Promise<ActionResult> {
  const parsed = CreateCategorySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("createCategory", "Categoría creada", () =>
    apiFetch("/categories", CategorySchema, {
      method: "POST",
      body: { name: parsed.data.name, subcategories: parsed.data.subcategories.map(({ name }) => name) },
    }),
  );
}

export async function renameCategory(categoryId: string, input: NameInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(categoryId);
  if (!id.success) return validationFailure(id.error);
  const parsed = NameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("renameCategory", "Categoría actualizada", () =>
    apiFetch(`/categories/${id.data}`, CategorySchema, { method: "PUT", body: parsed.data }),
  );
}

export async function setCategoryActive(categoryId: string, active: boolean): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(categoryId);
  if (!id.success) return validationFailure(id.error);

  return runMutation("setCategoryActive", active ? "Categoría activada" : "Categoría desactivada", () =>
    apiFetch(activationPath(`/categories/${id.data}`, active), EmptyDataSchema, { method: "POST" }),
  );
}

export async function createSubcategory(categoryId: string, input: NameInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(categoryId);
  if (!id.success) return validationFailure(id.error);
  const parsed = NameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("createSubcategory", "Subcategoría creada", () =>
    apiFetch(`/categories/${id.data}/subcategories`, SubcategorySchema, { method: "POST", body: parsed.data }),
  );
}

export async function renameSubcategory(
  categoryId: string,
  subcategoryId: string,
  input: NameInput,
): Promise<ActionResult> {
  const ids = EntityIdSchema.array().safeParse([categoryId, subcategoryId]);
  if (!ids.success) return validationFailure(ids.error);
  const parsed = NameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const [category, subcategory] = ids.data;
  return runMutation("renameSubcategory", "Subcategoría actualizada", () =>
    apiFetch(`/categories/${category}/subcategories/${subcategory}`, SubcategorySchema, {
      method: "PUT",
      body: parsed.data,
    }),
  );
}

export async function setSubcategoryActive(
  categoryId: string,
  subcategoryId: string,
  active: boolean,
): Promise<ActionResult> {
  const ids = EntityIdSchema.array().safeParse([categoryId, subcategoryId]);
  if (!ids.success) return validationFailure(ids.error);

  const [category, subcategory] = ids.data;
  return runMutation("setSubcategoryActive", active ? "Subcategoría activada" : "Subcategoría desactivada", () =>
    apiFetch(activationPath(`/categories/${category}/subcategories/${subcategory}`, active), EmptyDataSchema, {
      method: "POST",
    }),
  );
}
