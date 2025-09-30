export type DiscountMode = 'none' | 'percent' | 'amount';

export const computeDiscount = (
  subtotal: number,
  mode: DiscountMode,
  value: number
): { discount: number; total: number } => {
  if (mode === 'none' || value <= 0) {
    return { discount: 0, total: subtotal };
  }

  let discount = 0;

  if (mode === 'percent') {
    // Limitar porcentaje entre 0 y 100
    const percentage = Math.min(100, Math.max(0, value));
    discount = Math.round(subtotal * (percentage / 100));
  } else if (mode === 'amount') {
    // Limitar monto a no superar el subtotal
    discount = Math.min(subtotal, Math.max(0, value));
  }

  const total = Math.max(0, subtotal - discount);

  return { discount, total };
};