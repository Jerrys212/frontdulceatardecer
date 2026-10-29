const VAT_FACTOR = 1.16;

export const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function fromCents(cents: number) {
  return cents / 100;
}

export function vatBreakdown(totalCents: number) {
  const subtotalCents = Math.round(totalCents / VAT_FACTOR);
  return { subtotalCents, taxCents: totalCents - subtotalCents, totalCents };
}
