export function formatQuantity(
  quantity: number | null,
  unit: string | null
): string {
  if (quantity == null) return "—";
  const formatted = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toFixed(1);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function parseQuantityEstimate(raw: string | null): number | null {
  if (!raw) return null;
  const num = parseFloat(raw.replace(/[^\d.]/g, ""));
  return isNaN(num) ? null : num;
}
