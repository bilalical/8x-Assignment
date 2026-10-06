import catalog from "./products.json";
import type { Product } from "./types";

export const products: Product[] = catalog;
export const categories = ["Electronics", "Home", "Kitchen", "Fashion", "Outdoors", "Books", "Beauty"];
export const brands = [...new Set(products.map((product) => product.brand))].sort();
export const materials = [...new Set(products.map((product) => product.material))].sort();
export const findProduct = (id: string) => products.find((product) => product.id === id);
export const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { style: "currency", currency: "USD" });
export const imageUrl = (photo: string, width = 800) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) =>
    `${product.title} ${product.category} ${product.brand} ${product.material}`.toLowerCase().includes(normalized),
  );
}
