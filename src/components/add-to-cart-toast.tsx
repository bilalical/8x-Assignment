"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { formatPrice, imageUrl, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function AddToCartToast() {
  const { cart, cartToast, dismissCartToast } = useStore();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!cartToast || paused) return;
    const timeout = window.setTimeout(dismissCartToast, 5000);
    return () => window.clearTimeout(timeout);
  }, [cartToast, paused, dismissCartToast]);

  if (!cartToast) return null;
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cart.reduce((total, line) => {
    const product = products.find((item) => item.id === line.productId);
    return total + (product?.price ?? 0) * line.quantity;
  }, 0);

  return (
    <aside
      className="cart-toast"
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="cart-toast-heading"><span><Check size={16} /> Added to cart</span><button className="icon-button" onClick={dismissCartToast} aria-label="Close cart message"><X size={17} /></button></div>
      <div className="cart-toast-product"><img src={imageUrl(cartToast.product.image, 160)} alt="" /><strong>{cartToast.product.title}</strong></div>
      <p className="cart-toast-summary">{itemCount} {itemCount === 1 ? "item" : "items"} in cart <strong>{formatPrice(subtotal)}</strong></p>
      <div className="cart-toast-actions"><Link className="button button-secondary" href="/cart" onClick={dismissCartToast}>View cart</Link><Link className="button button-primary" href="/checkout" onClick={dismissCartToast}>Checkout</Link></div>
    </aside>
  );
}
