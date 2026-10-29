"use server";

import { refresh } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

import {
  CancelSaleSchema,
  IdempotencyKeySchema,
  PaySaleSchema,
  SaleRequestSchema,
  type CancelSaleInput,
  type SaleRequestInput,
} from "@/actions/sales/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { ApiError } from "@/data/api-error";
import { apiFetch } from "@/data/client";
import { ActiveExtraSchema } from "@/data/extras/types";
import { AvailableProductSchema } from "@/data/products/types";
import { SaleSchema, saleNumber, type PaymentMethod } from "@/data/sales/types";
import type { CatalogPrices } from "@/lib/sales/cart";
import { EntityIdSchema } from "@/lib/validations/ids";
import type { ActionFailure, ActionResult } from "@/types/api";

const PRICES_CHANGED_MESSAGE = "Los precios cambiaron, revisa el pedido";

type SavedSale = { id: string; number: string };

export type SaleSubmitResult =
  | { success: true; message: string; data: SavedSale }
  | { success: false; reason: "prices-changed"; message: string; correctTotal: number }
  | (ActionFailure & { reason: "error" });

function toSubmitFailure(error: unknown, scope: string): SaleSubmitResult {
  unstable_rethrow(error);
  if (error instanceof ApiError && error.statusCode === 409 && error.hasMessage(PRICES_CHANGED_MESSAGE)) {
    const correctTotal = z.number().safeParse(error.data);
    if (correctTotal.success) {
      return { success: false, reason: "prices-changed", message: error.message, correctTotal: correctTotal.data };
    }
  }
  return { ...toActionFailure(error, scope), reason: "error" };
}

export async function registerSale(input: SaleRequestInput, idempotencyKey: string): Promise<SaleSubmitResult> {
  const key = IdempotencyKeySchema.safeParse(idempotencyKey);
  if (!key.success) return { ...validationFailure(key.error), reason: "error" };
  const parsed = SaleRequestSchema.safeParse(input);
  if (!parsed.success) return { ...validationFailure(parsed.error), reason: "error" };

  try {
    const { data, message } = await apiFetch("/sales", SaleSchema, {
      method: "POST",
      body: parsed.data,
      headers: { "Idempotency-Key": key.data },
    });
    refresh();
    return { success: true, message: message ?? "Venta registrada", data: { id: data.id, number: saleNumber(data.id) } };
  } catch (error) {
    return toSubmitFailure(error, "registerSale");
  }
}

export async function updateSale(saleId: string, input: SaleRequestInput): Promise<SaleSubmitResult> {
  const id = EntityIdSchema.safeParse(saleId);
  if (!id.success) return { ...validationFailure(id.error), reason: "error" };
  const parsed = SaleRequestSchema.safeParse(input);
  if (!parsed.success) return { ...validationFailure(parsed.error), reason: "error" };

  try {
    const { data, message } = await apiFetch(`/sales/${id.data}`, SaleSchema, { method: "PUT", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Venta modificada", data: { id: data.id, number: saleNumber(data.id) } };
  } catch (error) {
    return toSubmitFailure(error, "updateSale");
  }
}

export async function paySale(saleId: string, paymentMethod: PaymentMethod): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(saleId);
  if (!id.success) return validationFailure(id.error);
  const parsed = PaySaleSchema.safeParse({ paymentMethod });
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/sales/${id.data}/pay`, SaleSchema, { method: "POST", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Venta cobrada", data: null };
  } catch (error) {
    return toActionFailure(error, "paySale");
  }
}

export async function cancelSale(saleId: string, input: CancelSaleInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(saleId);
  if (!id.success) return validationFailure(id.error);
  const parsed = CancelSaleSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/sales/${id.data}/cancel`, SaleSchema, { method: "POST", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Venta cancelada", data: null };
  } catch (error) {
    return toActionFailure(error, "cancelSale");
  }
}

export async function getCatalogPrices(): Promise<ActionResult<CatalogPrices>> {
  try {
    const [products, extras] = await Promise.all([
      apiFetch("/products", AvailableProductSchema.array()),
      apiFetch("/extras", ActiveExtraSchema.array()),
    ]);
    return { success: true, message: "", data: { products: products.data, extras: extras.data } };
  } catch (error) {
    return toActionFailure(error, "getCatalogPrices");
  }
}
