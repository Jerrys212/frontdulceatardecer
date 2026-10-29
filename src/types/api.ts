import { z } from "zod";

export const ApiEnvelopeSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string().nullable(),
  data: z.unknown(),
  errors: z.array(z.string()),
});

export const EmptyDataSchema = z.null();

export const PagedResultSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalCount: z.number().int(),
    totalPages: z.number().int(),
  });

export type ApiResult<T> = {
  data: T;
  message: string | null;
  headers: Headers;
};

export type ActionFailure = {
  success: false;
  message: string;
  errors: string[];
};

export type ActionResult<T = null> = { success: true; message: string; data: T } | ActionFailure;
