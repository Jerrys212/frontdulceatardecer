import { z } from "zod";

export const ApiEnvelopeSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string().nullable(),
  data: z.unknown(),
  errors: z.array(z.string()),
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

export type ActionResult = { success: true; message: string } | ActionFailure;
