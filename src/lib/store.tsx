"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products } from "./catalog";
import { isGiftCardLine } from "./types";
import type { CartLine, GiftCardCartLine, Order, Product, ProductCartLine, ReturnRequest, ShippingAddress } from "./types";
import { giftCards } from "./gift-cards";
import { getPromoDiscount, type PromoResult } from "./promotions";

type StoreData = {
  cart: CartLine[];
  lists: Record<string, string[]>;
  orders: Order[];
  address: ShippingAddress | null;
  signedIn: boolean;
  accountName: string;
  promoCode: string;
};

type CartToast = { id: number; product: Product; quantity: number; giftCard?: (typeof giftCards)[number] };

type StoreContextType = StoreData & {
  ready: boolean;
  currentTime: number | null;
  signIn: (name: string) => void;
  signOut: () => void;
  saveAddress: (address: ShippingAddress) => void;
  applyPromoCode: (code: string) => PromoResult;
  removePromoCode: () => void;
  requestReturn: (orderId: string, request: Omit<ReturnRequest, "id" | "requestedAt">) => boolean;
  cancelOrder: (orderId: string) => boolean;
  cartToast: CartToast | null;
  addToCart: (product: Product, quantity?: number) => void;
  addGiftCardToCart: (line: Omit<GiftCardCartLine, "lineId" | "quantity">) => void;
  dismissCartToast: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveToList: (listName: string, productId: string) => void;
  createOrder: (address: ShippingAddress, card: string) => string | null;
};

const STORAGE_KEY = "everyday-market-store-v1";
const ordersStorageKey = (userId: string) => `${STORAGE_KEY}:orders:${encodeURIComponent(userId)}`;
const demoUserId = (name: string) => `demo:${name.trim().toLocaleLowerCase("en-US")}`;
const normalizeOrderStatus = (status: unknown): Order["status"] =>
  status === "shipped" || status === "delivered" || status === "cancelled" ? status : "processing";
const initialData: StoreData = { cart: [], lists: { "Shopping List": [] }, orders: [], address: null, signedIn: false, accountName: "", promoCode: "" };
const StoreContext = createContext<StoreContextType | null>(null);
const priceById = Object.fromEntries(products.map((product) => [product.id, product.price]));

function isOrderForUser(value: unknown, userId: string): value is Order {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<Order>;
  return order.userId === userId &&
    typeof order.id === "string" &&
    typeof order.placedAt === "string" &&
    Array.isArray(order.items) &&
    typeof order.address === "object" &&
    order.address !== null &&
    typeof order.lastFour === "string" &&
    typeof order.subtotal === "number" &&
    typeof order.tax === "number" &&
    typeof order.total === "number";
}

function loadUserOrders(userId: string): Order[] {
  const key = ordersStorageKey(userId);
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved order history must be an array.");
    return parsed
      .filter((order): order is Order => isOrderForUser(order, userId))
      .map((order) => ({ ...order, status: normalizeOrderStatus(order.status) }));
  } catch (error) {
    console.error("Could not load saved order history.", error);
    try {
      window.localStorage.removeItem(key);
    } catch (removeError) {
      console.error("Could not clear invalid saved order history.", removeError);
    }
    return [];
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>(initialData);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [cartToast, setCartToast] = useState<CartToast | null>(null);
  const noticeId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedData = JSON.parse(saved) as Partial<StoreData>;
          const accountName = typeof savedData.accountName === "string" ? savedData.accountName.trim() : "";
          const signedIn = savedData.signedIn === true && accountName.length > 0;
          setData({
            ...initialData,
            ...savedData,
            signedIn,
            accountName: signedIn ? accountName : "",
            orders: signedIn ? loadUserOrders(demoUserId(accountName)) : [],
          });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setCurrentTime(Date.now());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, orders: [] }));
    if (data.signedIn && data.accountName) {
      const userId = demoUserId(data.accountName);
      const userOrders = data.orders.filter((order) => order.userId === userId);
      window.localStorage.setItem(ordersStorageKey(userId), JSON.stringify(userOrders));
    }
  }, [data, ready]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setData((previous) => {
      const existing = previous.cart.find((line): line is ProductCartLine => !isGiftCardLine(line) && line.productId === product.id);
      return {
        ...previous,
        cart: existing
          ? previous.cart.map((line) =>
              !isGiftCardLine(line) && line.productId === product.id ? { ...line, quantity: line.quantity + quantity } : line,
            )
          : [...previous.cart, { productId: product.id, quantity }],
      };
    });
    setCartToast({ id: ++noticeId.current, product, quantity });
  }, []);
  const addGiftCardToCart = useCallback((line: Omit<GiftCardCartLine, "lineId" | "quantity">) => {
    const card = giftCards.find((item) => item.id === line.giftCardId);
    if (!card) return;
    const giftLine: GiftCardCartLine = { ...line, lineId: crypto.randomUUID(), quantity: 1 };
    setData((previous) => ({ ...previous, cart: [...previous.cart, giftLine] }));
    setCartToast({ id: ++noticeId.current, giftCard: card, product: {
      id: card.id,
      title: card.name,
      category: "Gift Cards",
      price: line.amount,
      rating: 5,
      reviews: 0,
      brand: card.brand,
      material: "",
      prime: false,
      image: "",
      description: "",
    }, quantity: 1 });
  }, []);
  const dismissCartToast = useCallback(() => setCartToast(null), []);
  const signIn = useCallback((name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;
    const userId = demoUserId(normalizedName);
    const orders = loadUserOrders(userId);
    setData((previous) => ({ ...previous, signedIn: true, accountName: normalizedName, orders }));
  }, []);
  const signOut = useCallback(() => {
    setData((previous) => ({ ...previous, signedIn: false, accountName: "", orders: [] }));
  }, []);
  const saveAddress = useCallback((address: ShippingAddress) => {
    setData((previous) => ({ ...previous, address }));
  }, []);
  const applyPromoCode = useCallback((code: string) => {
    const subtotal = data.cart.reduce((sum, line) => sum + line.quantity * (isGiftCardLine(line) ? line.amount : priceById[line.productId] ?? 0), 0);
    const result = getPromoDiscount(code, subtotal, Date.now());
    if (result.ok) setData((previous) => ({ ...previous, promoCode: result.code }));
    return result;
  }, [data.cart]);
  const removePromoCode = useCallback(() => {
    setData((previous) => ({ ...previous, promoCode: "" }));
  }, []);
  const requestReturn = useCallback((orderId: string, request: Omit<ReturnRequest, "id" | "requestedAt">) => {
    const userId = data.signedIn ? demoUserId(data.accountName) : "";
    const order = data.orders.find((item) => item.id === orderId && item.userId === userId);
    const age = order ? Date.now() - new Date(order.placedAt).getTime() : -1;
    const withinReturnWindow = age >= 0 && age <= 30 * 24 * 60 * 60 * 1000;
    if (!order || order.status !== "delivered" || !withinReturnWindow || order.returnRequest || !request.items.length ||
      !request.reason.trim() || !["refund", "replacement"].includes(request.resolution)) return false;
    const selectedCounts = new Map<string, number>();
    for (const selected of request.items) {
      selectedCounts.set(selected.productId, (selectedCounts.get(selected.productId) ?? 0) + selected.quantity);
    }
    const validItems = [...selectedCounts].every(([productId, quantity]) => {
      const purchased = order.items.find((line) => !isGiftCardLine(line) && line.productId === productId);
      return purchased && quantity > 0 && quantity <= purchased.quantity;
    });
    if (!validItems) return false;
    const returnRequest: ReturnRequest = {
      ...request,
      id: `RET-${Date.now().toString(36).toUpperCase()}`,
      requestedAt: new Date().toISOString(),
    };
    setData((previous) => ({
      ...previous,
      orders: previous.orders.map((item) => item.id === orderId && item.userId === userId ? { ...item, returnRequest } : item),
    }));
    return true;
  }, [data.accountName, data.orders, data.signedIn]);
  const cancelOrder = useCallback((orderId: string) => {
    const userId = data.signedIn ? demoUserId(data.accountName) : "";
    const order = data.orders.find((item) => item.id === orderId && item.userId === userId);
    if (!order || order.status !== "processing") return false;
    setData((previous) => ({
      ...previous,
      orders: previous.orders.map((item) => item.id === orderId && item.userId === userId ? { ...item, status: "cancelled" } : item),
    }));
    return true;
  }, [data.accountName, data.orders, data.signedIn]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setData((previous) => ({
      ...previous,
      cart: quantity < 1
        ? previous.cart.filter((line) => isGiftCardLine(line) ? line.lineId !== productId : line.productId !== productId)
        : previous.cart.map((line) => (isGiftCardLine(line) ? line.lineId === productId : line.productId === productId) ? { ...line, quantity } : line),
    }));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setData((previous) => ({
      ...previous,
      cart: previous.cart.filter((line) => isGiftCardLine(line) ? line.lineId !== productId : line.productId !== productId),
    }));
  }, []);

  const saveToList = useCallback((listName: string, productId: string) => {
    setData((previous) => ({
      ...previous,
      lists: {
        ...previous.lists,
        [listName]: [...new Set([...(previous.lists[listName] ?? []), productId])],
      },
    }));
  }, []);

  const createOrder = useCallback((address: ShippingAddress, card: string) => {
    if (!data.cart.length || !data.signedIn || !data.accountName.trim()) return null;
    const userId = demoUserId(data.accountName);
    const subtotal = data.cart.reduce((sum, line) => sum + line.quantity * (isGiftCardLine(line) ? line.amount : priceById[line.productId] ?? 0), 0);
    const promo = data.promoCode ? getPromoDiscount(data.promoCode, subtotal, Date.now()) : null;
    if (promo && !promo.ok) return null;
    const discountAmount = promo?.ok ? promo.discountAmount : 0;
    const taxableSubtotal = data.cart.reduce((sum, line) =>
      sum + (!isGiftCardLine(line) ? line.quantity * (priceById[line.productId] ?? 0) : 0), 0);
    const taxableDiscount = subtotal > 0 ? discountAmount * (taxableSubtotal / subtotal) : 0;
    const roundedTax = Number((Math.max(0, taxableSubtotal - taxableDiscount) * 0.085).toFixed(2));
    const total = Number((subtotal - discountAmount + roundedTax).toFixed(2));
    if (!Number.isFinite(total) || total <= 0) return null;
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      userId,
      placedAt: new Date().toISOString(),
      items: data.cart,
      address,
      lastFour: card.replace(/\D/g, "").slice(-4),
      subtotal,
      tax: roundedTax,
      total,
      status: "processing",
      ...(promo?.ok ? { discountCode: promo.code, discountAmount: promo.discountAmount } : {}),
    };
    setData((previous) => ({ ...previous, cart: [], address, promoCode: "", orders: [order, ...previous.orders] }));
    return order.id;
  }, [data]);

  const value = useMemo(
    () => ({ ...data, ready, currentTime, cartToast, addToCart, addGiftCardToCart, dismissCartToast, signIn, signOut, saveAddress, applyPromoCode, removePromoCode, requestReturn, cancelOrder, setQuantity, removeFromCart, saveToList, createOrder }),
    [data, ready, currentTime, cartToast, addToCart, addGiftCardToCart, dismissCartToast, signIn, signOut, saveAddress, applyPromoCode, removePromoCode, requestReturn, cancelOrder, setQuantity, removeFromCart, saveToList, createOrder],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
