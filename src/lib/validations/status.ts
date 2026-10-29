import { z } from "zod";

export const ActiveStatusSchema = z.enum(["active", "inactive"]);
export type ActiveStatus = z.infer<typeof ActiveStatusSchema>;
export const StatusFilterSchema = z.enum(["all", ...ActiveStatusSchema.options]);
export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export function isActiveParam(status: ActiveStatus | undefined) {
  return status === undefined ? undefined : status === "active";
}

export function matchesStatus(isActive: boolean, status: StatusFilter) {
  return status === "all" || isActive === (status === "active");
}
