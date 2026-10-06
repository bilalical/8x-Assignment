"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products } from "./catalog";
import type { CartLine, Order, Product, ShippingAddress } from "./types";

type StoreData = {
  cart: CartLine[];
  lists: Record<string, string[]>;
  orders: Order[];
  address: ShippingAddress | null;
};

type CartToast = { id: number; product: Product; quantity: number };

type StoreContextType = StoreData & {
  ready: boolean;
  cartToast: CartToast | null;
  addToCart: (product: Product, quantity?: number) => void;
  dismissCartToast: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveToList: (listName: string, productId: string) => void;
  createOrder: (address: ShippingAddress, card: string) => string | null;
};

const STORAGE_KEY = "everyday-market-store-v1";
const initialData: StoreData = { cart: [], lists: { "Shopping List": [] }, orders: [], address: null };
const StoreContext = createContext<StoreContextType | null>(null);
const priceById = Object.fromEntries(products.map((product) => [product.id, product.price]));

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>(initialData);
  const [ready, setReady] = useState(false);
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
    const total = data.cart.reduce(
      (sum, line) => sum + line.quantity * (priceById[line.productId] ?? 0),
      0,
    );
    if (!Number.isFinite(total) || total <= 0) return null;
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      placedAt: new Date().toISOString(),
      items: data.cart,
      address,
      lastFour: card.replace(/\D/g, "").slice(-4),
      total,
    };
    setData((previous) => ({ ...previous, cart: [], address, orders: [order, ...previous.orders] }));
    return order.id;
  }, [data]);

  const value = useMemo(
    () => ({ ...data, ready, cartToast, addToCart, dismissCartToast, setQuantity, removeFromCart, saveToList, createOrder }),
    [data, ready, cartToast, addToCart, dismissCartToast, setQuantity, removeFromCart, saveToList, createOrder],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
