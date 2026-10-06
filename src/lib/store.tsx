"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products } from "./catalog";
import type { CartLine, Order, Product, ReturnRequest, ShippingAddress } from "./types";
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

type CartToast = { id: number; product: Product; quantity: number };

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
  dismissCartToast: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveToList: (listName: string, productId: string) => void;
  createOrder: (address: ShippingAddress, card: string) => string | null;
};

const STORAGE_KEY = "everyday-market-store-v1";
const seedAddress: ShippingAddress = {
  fullName: "Casey Morgan",
  street: "72 Oak Lane",
  apartment: "",
  city: "Burlington",
  state: "VT",
  zip: "05401",
  phone: "802-555-0100",
};
const orderDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};
const seededOrders: Order[] = [
  {
    id: "ORD-PAST-DELIVERED",
    placedAt: orderDate(8),
    items: [{ productId: "linen-throw", quantity: 1 }, { productId: "ceramic-mug", quantity: 2 }],
    address: seedAddress,
    lastFour: "4242",
    subtotal: 110.99,
    tax: 9.43,
    total: 120.42,
    status: "delivered",
  },
  {
    id: "ORD-PAST-SHIPPED",
    placedAt: orderDate(12),
    items: [{ productId: "trail-bottle", quantity: 1 }],
    address: seedAddress,
    lastFour: "4242",
    subtotal: 31.95,
    tax: 2.72,
    total: 34.67,
    status: "shipped",
  },
  {
    id: "ORD-PAST-OLDER",
    placedAt: orderDate(48),
    items: [{ productId: "desk-lamp", quantity: 1 }],
    address: seedAddress,
    lastFour: "4242",
    subtotal: 42.5,
    tax: 3.61,
    total: 46.11,
    status: "delivered",
  },
];
const initialData: StoreData = { cart: [], lists: { "Shopping List": [] }, orders: seededOrders, address: null, signedIn: false, accountName: "", promoCode: "" };
const StoreContext = createContext<StoreContextType | null>(null);
const priceById = Object.fromEntries(products.map((product) => [product.id, product.price]));

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
        if (saved) setData({ ...initialData, ...JSON.parse(saved) as Partial<StoreData> });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setCurrentTime(Date.now());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setData((previous) => {
      const existing = previous.cart.find((line) => line.productId === product.id);
      return {
        ...previous,
        cart: existing
          ? previous.cart.map((line) =>
              line.productId === product.id ? { ...line, quantity: line.quantity + quantity } : line,
            )
          : [...previous.cart, { productId: product.id, quantity }],
      };
    });
    setCartToast({ id: ++noticeId.current, product, quantity });
  }, []);
  const dismissCartToast = useCallback(() => setCartToast(null), []);
  const signIn = useCallback((name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;
    setData((previous) => ({ ...previous, signedIn: true, accountName: normalizedName }));
  }, []);
  const signOut = useCallback(() => {
    setData((previous) => ({ ...previous, signedIn: false, accountName: "" }));
  }, []);
  const saveAddress = useCallback((address: ShippingAddress) => {
    setData((previous) => ({ ...previous, address }));
  }, []);
  const applyPromoCode = useCallback((code: string) => {
    const subtotal = data.cart.reduce((sum, line) => sum + line.quantity * (priceById[line.productId] ?? 0), 0);
    const result = getPromoDiscount(code, subtotal, Date.now());
    if (result.ok) setData((previous) => ({ ...previous, promoCode: result.code }));
    return result;
  }, [data.cart]);
  const removePromoCode = useCallback(() => {
    setData((previous) => ({ ...previous, promoCode: "" }));
  }, []);
  const requestReturn = useCallback((orderId: string, request: Omit<ReturnRequest, "id" | "requestedAt">) => {
    const order = data.orders.find((item) => item.id === orderId);
    const age = order ? Date.now() - new Date(order.placedAt).getTime() : -1;
    const withinReturnWindow = age >= 0 && age <= 30 * 24 * 60 * 60 * 1000;
    if (!order || order.status !== "delivered" || !withinReturnWindow || order.returnRequest || !request.items.length ||
      !request.reason.trim() || !["refund", "replacement"].includes(request.resolution)) return false;
    const selectedCounts = new Map<string, number>();
    for (const selected of request.items) {
      selectedCounts.set(selected.productId, (selectedCounts.get(selected.productId) ?? 0) + selected.quantity);
    }
    const validItems = [...selectedCounts].every(([productId, quantity]) => {
      const purchased = order.items.find((line) => line.productId === productId);
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
      orders: previous.orders.map((item) => item.id === orderId ? { ...item, returnRequest } : item),
    }));
    return true;
  }, [data.orders]);
  const cancelOrder = useCallback((orderId: string) => {
    const order = data.orders.find((item) => item.id === orderId);
    if (!order || order.status !== "processing") return false;
    setData((previous) => ({
      ...previous,
      orders: previous.orders.map((item) => item.id === orderId ? { ...item, status: "cancelled" } : item),
    }));
    return true;
  }, [data.orders]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setData((previous) => ({
      ...previous,
      cart: quantity < 1
        ? previous.cart.filter((line) => line.productId !== productId)
        : previous.cart.map((line) => line.productId === productId ? { ...line, quantity } : line),
    }));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setData((previous) => ({ ...previous, cart: previous.cart.filter((line) => line.productId !== productId) }));
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
    if (!data.cart.length) return null;
    const subtotal = data.cart.reduce(
      (sum, line) => sum + line.quantity * (priceById[line.productId] ?? 0),
      0,
    );
    const promo = data.promoCode ? getPromoDiscount(data.promoCode, subtotal, Date.now()) : null;
    if (promo && !promo.ok) return null;
    const discountAmount = promo?.ok ? promo.discountAmount : 0;
    const taxableSubtotal = subtotal - discountAmount;
    const tax = Number((taxableSubtotal * 0.085).toFixed(2));
    const total = Number((taxableSubtotal + tax).toFixed(2));
    if (!Number.isFinite(total) || total <= 0) return null;
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      placedAt: new Date().toISOString(),
      items: data.cart,
      address,
      lastFour: card.replace(/\D/g, "").slice(-4),
      subtotal,
      tax,
      total,
      status: "processing",
      ...(promo?.ok ? { discountCode: promo.code, discountAmount: promo.discountAmount } : {}),
    };
    setData((previous) => ({ ...previous, cart: [], address, promoCode: "", orders: [order, ...previous.orders] }));
    return order.id;
  }, [data]);

  const value = useMemo(
    () => ({ ...data, ready, currentTime, cartToast, addToCart, dismissCartToast, signIn, signOut, saveAddress, applyPromoCode, removePromoCode, requestReturn, cancelOrder, setQuantity, removeFromCart, saveToList, createOrder }),
    [data, ready, currentTime, cartToast, addToCart, dismissCartToast, signIn, signOut, saveAddress, applyPromoCode, removePromoCode, requestReturn, cancelOrder, setQuantity, removeFromCart, saveToList, createOrder],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
