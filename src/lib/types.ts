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
  total: number;
};
