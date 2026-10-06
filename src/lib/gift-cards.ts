export type GiftCardType = "eGift" | "Physical";
export type GiftCardCategory = "brand" | "birthday" | "thank-you" | "holiday" | "congratulations";

export type GiftCard = {
  id: string;
  name: string;
  brand: string;
  type: GiftCardType;
  category: GiftCardCategory;
  price: number;
  listPrice?: number;
};

export const giftCards: GiftCard[] = [
  { id: "starbucks", name: "Starbucks eGift Card", brand: "Starbucks", type: "eGift", category: "brand", price: 25, listPrice: 30 },
  { id: "apple", name: "Apple Gift Card", brand: "Apple", type: "eGift", category: "brand", price: 25 },
  { id: "google-play", name: "Google Play Gift Card", brand: "Google Play", type: "eGift", category: "brand", price: 25 },
  { id: "uber-eats", name: "Uber Eats Gift Card", brand: "Uber Eats", type: "eGift", category: "brand", price: 25 },
  { id: "doordash", name: "DoorDash Gift Card", brand: "DoorDash", type: "eGift", category: "brand", price: 25, listPrice: 30 },
  { id: "hm", name: "H&M Physical Gift Card", brand: "H&M", type: "Physical", category: "brand", price: 50 },
  { id: "netflix", name: "Netflix eGift Card", brand: "Netflix", type: "eGift", category: "brand", price: 25 },
  { id: "spotify", name: "Spotify eGift Card", brand: "Spotify", type: "eGift", category: "brand", price: 30 },
  { id: "steam", name: "Steam Gift Card", brand: "Steam", type: "eGift", category: "brand", price: 20, listPrice: 25 },
  { id: "nike", name: "Nike Physical Gift Card", brand: "Nike", type: "Physical", category: "brand", price: 50 },
  { id: "target", name: "Target Physical Gift Card", brand: "Target", type: "Physical", category: "brand", price: 50 },
  { id: "walmart", name: "Walmart Physical Gift Card", brand: "Walmart", type: "Physical", category: "brand", price: 50 },
  { id: "birthday", name: "Birthday eGift Card", brand: "Amazon", type: "eGift", category: "birthday", price: 25 },
  { id: "thank-you", name: "Thank You eGift Card", brand: "Amazon", type: "eGift", category: "thank-you", price: 25 },
  { id: "holiday", name: "Holiday Physical Gift Card", brand: "Amazon", type: "Physical", category: "holiday", price: 50, listPrice: 60 },
  { id: "congratulations", name: "Congratulations eGift Card", brand: "Amazon", type: "eGift", category: "congratulations", price: 25 },
];

export const celebrationCategories: { id: GiftCardCategory; label: string }[] = [
  { id: "birthday", label: "Birthday" },
  { id: "thank-you", label: "Thank You" },
  { id: "holiday", label: "Holiday" },
  { id: "congratulations", label: "Congratulations" },
];
