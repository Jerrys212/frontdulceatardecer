"use server";

import { refresh } from "next/cache";

import { CreateCategorySchema, NameSchema, type CreateCategoryInput, type NameInput } from "@/actions/categories/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { EmptyDataSchema } from "@/data/auth/types";
import { CategorySchema, SubcategorySchema } from "@/data/categories/types";
import { apiFetch } from "@/data/client";
import { EntityIdSchema } from "@/lib/validations/ids";
import type { ActionResult } from "@/types/api";

export async function createCategory(input: CreateCategoryInput): Promise<ActionResult> {
  const parsed = CreateCategorySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch("/categories", CategorySchema, {
      method: "POST",
      body: { name: parsed.data.name, subcategories: parsed.data.subcategories.map(({ name }) => name) },
    });
    refresh();
    return { success: true, message: message ?? "Categoría creada", data: null };
  } catch (error) {
    return toActionFailure(error, "createCategory");
  }
}

export async function renameCategory(categoryId: string, input: NameInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(categoryId);
  if (!id.success) return validationFailure(id.error);
  const parsed = NameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/categories/${id.data}`, CategorySchema, { method: "PUT", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Categoría actualizada", data: null };
  } catch (error) {
    return toActionFailure(error, "renameCategory");
  }
}

export async function setCategoryActive(categoryId: string, active: boolean): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(categoryId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { message } = await apiFetch(`/categories/${id.data}/${active ? "activate" : "deactivate"}`, EmptyDataSchema, {
      method: "POST",
    });
    refresh();
    return { success: true, message: message ?? (active ? "Categoría activada" : "Categoría desactivada"), data: null };
  } catch (error) {
    return toActionFailure(error, "setCategoryActive");
  }
}

export async function createSubcategory(categoryId: string, input: NameInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(categoryId);
  if (!id.success) return validationFailure(id.error);
  const parsed = NameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/categories/${id.data}/subcategories`, SubcategorySchema, {
      method: "POST",
      body: parsed.data,
    });
    refresh();
    return { success: true, message: message ?? "Subcategoría creada", data: null };
  } catch (error) {
    return toActionFailure(error, "createSubcategory");
  }
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

  try {
    const [category, subcategory] = ids.data;
    const { message } = await apiFetch(`/categories/${category}/subcategories/${subcategory}`, SubcategorySchema, {
      method: "PUT",
      body: parsed.data,
    });
    refresh();
    return { success: true, message: message ?? "Subcategoría actualizada", data: null };
  } catch (error) {
    return toActionFailure(error, "renameSubcategory");
  }
}

export async function setSubcategoryActive(
  categoryId: string,
  subcategoryId: string,
  active: boolean,
): Promise<ActionResult> {
  const ids = EntityIdSchema.array().safeParse([categoryId, subcategoryId]);
  if (!ids.success) return validationFailure(ids.error);

  try {
    const [category, subcategory] = ids.data;
    const { message } = await apiFetch(
      `/categories/${category}/subcategories/${subcategory}/${active ? "activate" : "deactivate"}`,
      EmptyDataSchema,
      { method: "POST" },
    );
    refresh();
    return {
      success: true,
      message: message ?? (active ? "Subcategoría activada" : "Subcategoría desactivada"),
      data: null,
    };
  } catch (error) {
    return toActionFailure(error, "setSubcategoryActive");
  }
}
