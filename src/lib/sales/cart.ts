import { toCents, vatBreakdown } from "@/lib/money";

export const MAX_LINES = 50;
export const MAX_LINE_QUANTITY = 50;
export const MAX_EXTRA_QUANTITY = 10;
export const MAX_NOTE_LENGTH = 200;
export const MAX_CUSTOMER_LENGTH = 100;

export type CartExtra = {
  extraId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type CartLine = {
  key: string;
  productId: string;
  productName: string;
  categoryName: string;
  subcategoryName: string;
  priceCents: number;
  quantity: number;
  note: string;
  extras: CartExtra[];
  notice: string | null;
  unavailable: boolean;
};

export type CatalogPrices = {
  products: { id: string; name: string; price: number }[];
  extras: { id: string; name: string; price: number }[];
};

export function lineUnitCents(line: Pick<CartLine, "priceCents" | "extras">) {
  return line.priceCents + line.extras.reduce((sum, extra) => sum + extra.priceCents * extra.quantity, 0);
}

export function lineAmountCents(line: Pick<CartLine, "priceCents" | "extras" | "quantity">) {
  return lineUnitCents(line) * line.quantity;
}

export function cartTotals(lines: CartLine[]) {
  return vatBreakdown(lines.reduce((sum, line) => sum + lineAmountCents(line), 0));
}

export function isPlainLine(line: CartLine) {
  return line.extras.length === 0 && line.note.trim() === "" && !line.unavailable;
}

export function toSaleItems(lines: CartLine[]) {
  return lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    note: line.note.trim() === "" ? null : line.note.trim(),
    extras: line.extras.map(({ extraId, quantity }) => ({ extraId, quantity })),
  }));
}

export function applyCatalogPrices(lines: CartLine[], catalog: CatalogPrices): CartLine[] {
  const products = new Map(catalog.products.map((product) => [product.id, product]));
  const extras = new Map(catalog.extras.map((extra) => [extra.id, extra]));

  return lines.map((line) => {
    const product = products.get(line.productId);
    if (!product) {
      return { ...line, unavailable: true, notice: "Este producto ya no está disponible. Quítalo del pedido." };
    }

    const removed: string[] = [];
    const nextExtras: CartExtra[] = [];
    for (const extra of line.extras) {
      const current = extras.get(extra.extraId);
      if (current) nextExtras.push({ ...extra, name: current.name, priceCents: toCents(current.price) });
      else removed.push(extra.name);
    }

    const next: CartLine = {
      ...line,
      productName: product.name,
      priceCents: toCents(product.price),
      extras: nextExtras,
      unavailable: false,
    };

    const notices: string[] = [];
    if (lineUnitCents(next) !== lineUnitCents(line) && removed.length === 0) notices.push("Precio actualizado");
    if (removed.length > 0) notices.push(`Se quitó ${removed.join(", ")} (ya no está disponible)`);
    return { ...next, notice: notices.length > 0 ? notices.join(" · ") : line.notice };
  });
}
