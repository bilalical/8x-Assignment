export type PromoError = "invalid" | "expired" | "minimum";
export type PromoResult =
  | { ok: true; code: string; discountAmount: number }
  | { ok: false; error: PromoError };

type Promotion = {
  expiresAt: number | null;
  discount: (subtotal: number) => number | null;
};

const promotions: Record<string, Promotion> = {
  WELCOME10: {
    expiresAt: null,
    discount: (subtotal) => subtotal * 0.1,
  },
  SAVE5: {
    expiresAt: null,
    discount: (subtotal) => subtotal > 40 ? 5 : null,
  },
  EXPIRED: {
    expiresAt: 0,
    discount: () => 0,
  },
};

export function getPromoDiscount(code: string, subtotal: number, currentTime: number): PromoResult {
  const normalizedCode = code.trim().toUpperCase();
  const promotion = promotions[normalizedCode];
  if (!promotion) return { ok: false, error: "invalid" };
  if (promotion.expiresAt !== null && currentTime >= promotion.expiresAt) return { ok: false, error: "expired" };
  const discountAmount = promotion.discount(subtotal);
  if (discountAmount === null) return { ok: false, error: "minimum" };
  return { ok: true, code: normalizedCode, discountAmount: Number(discountAmount.toFixed(2)) };
}

export const promoErrorMessage: Record<PromoError, string> = {
  invalid: "That promo code isn’t valid. Check the code and try again.",
  expired: "This promo code has expired.",
  minimum: "SAVE5 requires an order subtotal over $40.",
};
