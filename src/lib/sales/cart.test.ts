import { describe, expect, it } from "vitest";

import {
  applyCatalogPrices,
  cartTotals,
  lineAmountCents,
  lineUnitCents,
  toSaleItems,
  type CartLine,
} from "@/lib/sales/cart";
import { vatBreakdown } from "@/lib/money";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    key: "a",
    productId: "p1",
    productName: "Waffle clásico",
    categoryName: "Waffles",
    subcategoryName: "Clásicos",
    priceCents: 7500,
    quantity: 1,
    note: "",
    extras: [],
    notice: null,
    unavailable: false,
    ...overrides,
  };
}

describe("vatBreakdown", () => {
  it("matches the backend example: 220.00 → 189.66 + 30.34", () => {
    expect(vatBreakdown(22000)).toEqual({ subtotalCents: 18966, taxCents: 3034, totalCents: 22000 });
  });

  it("always adds up to the total", () => {
    for (let total = 0; total <= 100_000; total += 37) {
      const { subtotalCents, taxCents } = vatBreakdown(total);
      expect(subtotalCents + taxCents).toBe(total);
    }
  });
});

describe("line amounts", () => {
  it("adds every extra times its quantity to the unit price", () => {
    const withExtras = line({
      extras: [
        { extraId: "e1", name: "Extra fresa", priceCents: 1500, quantity: 2 },
        { extraId: "e2", name: "Canela", priceCents: 0, quantity: 1 },
      ],
      quantity: 3,
    });
    expect(lineUnitCents(withExtras)).toBe(7500 + 3000);
    expect(lineAmountCents(withExtras)).toBe((7500 + 3000) * 3);
  });

  it("avoids floating point drift on decimal prices", () => {
    const lines = [line({ priceCents: 1010, quantity: 3 }), line({ key: "b", priceCents: 2020, quantity: 3 })];
    expect(cartTotals(lines).totalCents).toBe(9090);
  });
});

describe("toSaleItems", () => {
  it("sends a trimmed note or null and only ids and quantities for extras", () => {
    const items = toSaleItems([
      line({ note: "  bien dorados ", extras: [{ extraId: "e1", name: "Extra fresa", priceCents: 1500, quantity: 1 }] }),
      line({ key: "b", note: "   " }),
    ]);
    expect(items).toEqual([
      { productId: "p1", quantity: 1, note: "bien dorados", extras: [{ extraId: "e1", quantity: 1 }] },
      { productId: "p1", quantity: 1, note: null, extras: [] },
    ]);
  });
});

describe("applyCatalogPrices", () => {
  const catalog = {
    products: [{ id: "p1", name: "Waffle clásico", price: 80 }],
    extras: [{ id: "e1", name: "Extra fresa", price: 15 }],
  };

  it("updates prices and flags the line", () => {
    const [updated] = applyCatalogPrices([line()], catalog);
    expect(updated.priceCents).toBe(8000);
    expect(updated.notice).toBe("Precio actualizado");
  });

  it("marks products that are no longer available", () => {
    const [updated] = applyCatalogPrices([line({ productId: "gone" })], catalog);
    expect(updated.unavailable).toBe(true);
  });

  it("drops extras that are no longer available", () => {
    const [updated] = applyCatalogPrices(
      [line({ priceCents: 8000, extras: [{ extraId: "gone", name: "Chispas", priceCents: 0, quantity: 1 }] })],
      catalog,
    );
    expect(updated.extras).toEqual([]);
    expect(updated.notice).toContain("Chispas");
  });

  it("leaves untouched lines without a notice", () => {
    const [updated] = applyCatalogPrices([line({ priceCents: 8000 })], catalog);
    expect(updated.notice).toBeNull();
  });
});
