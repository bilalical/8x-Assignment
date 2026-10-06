export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  brand: string;
  material: string;
  prime: boolean;
  badge?: string;
  condition?: string;
  inStock?: boolean;
  discountPercent?: number;
  image: string;
  description: string;
}

export type ProductCartLine = { productId: string; quantity: number };
export type GiftCardCartLine = {
  giftCardId: string;
  lineId: string;
  quantity: number;
  amount: number;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
};
export type CartLine = ProductCartLine | GiftCardCartLine;

export function isGiftCardLine(line: CartLine): line is GiftCardCartLine {
  return "giftCardId" in line;
}

export type ShippingAddress = {
  fullName: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

export type Order = {
  id: string;
  userId: string;
  placedAt: string;
  items: CartLine[];
  address: ShippingAddress;
  lastFour: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  discountCode?: string;
  discountAmount?: number;
  returnRequest?: ReturnRequest;
};

export type ReturnRequest = {
  id: string;
  items: ProductCartLine[];
  reason: string;
  resolution: "refund" | "replacement";
  requestedAt: string;
};
