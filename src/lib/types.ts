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

export type CartLine = { productId: string; quantity: number };

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
  items: CartLine[];
  reason: string;
  resolution: "refund" | "replacement";
  requestedAt: string;
};
