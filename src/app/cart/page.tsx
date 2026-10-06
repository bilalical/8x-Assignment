"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductRail } from "@/components/product-rail";
import { AddToListModal } from "@/components/add-to-list-modal";
import { PromoCodeField } from "@/components/promo-code-field";
import { formatPrice, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { getPromoDiscount } from "@/lib/promotions";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const { cart, ready, currentTime, promoCode, setQuantity, removeFromCart } = useStore();
  const [saveProduct, setSaveProduct] = useState<Product | null>(null);
  const items = cart.map((line) => ({ ...line, product: products.find((item) => item.id === line.productId) }))
    .filter((line): line is typeof line & { product: Product } => Boolean(line.product));
  const subtotal = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const promoResult = promoCode ? getPromoDiscount(promoCode, subtotal, currentTime ?? 0) : null;
  const discount = promoResult?.ok ? promoResult.discountAmount : 0;

  return (
    <div className="container page-shell">
      <div className="breadcrumb"><Link href="/">Home</Link>　›　Your cart</div>
      <div className="cart-layout">
        <section className="cart-panel">
          <div className="cart-heading"><h1>Your cart</h1><span>{items.reduce((sum, line) => sum + line.quantity, 0)} {items.length === 1 && items[0]?.quantity === 1 ? "item" : "items"}</span></div>
          {!ready ? <p className="muted">Loading your cart…</p> : items.length === 0 ? (
            <div className="empty-state cart-empty">
              <div className="order-success-icon"><ShoppingBag size={25} /></div>
              <h2>Your cart is taking a little breather.</h2>
              <p>When you find something you like, it’ll be waiting here.</p>
              <Link href="/search" className="button button-primary">Explore the shop</Link>
            </div>
          ) : items.map(({ product, quantity }) => (
            <article key={product.id} className="cart-row">
              <Link className="cart-row-image" href={`/product/${product.id}`}><img src={`https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=360&q=80`} alt={product.title} /></Link>
              <div className="cart-row-info">
                <Link href={`/product/${product.id}`} className="cart-row-title">{product.title}</Link>
                <span className="muted">{product.brand} · {product.category}</span>
                <div className="cart-actions-inline">
                  <div className="quantity-control" aria-label={`Quantity for ${product.title}`}>
                    <button aria-label="Decrease quantity" onClick={() => setQuantity(product.id, quantity - 1)}><Minus size={13} /></button>
                    <input aria-label="Quantity" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(product.id, Math.max(0, Number(event.target.value) || 0))} />
                    <button aria-label="Increase quantity" onClick={() => setQuantity(product.id, quantity + 1)}><Plus size={13} /></button>
                  </div>
                  <button className="link-button" onClick={() => removeFromCart(product.id)}><Trash2 size={13} /> Remove</button>
                  <span className="action-divider">·</span>
                  <button className="link-button" onClick={() => setSaveProduct(product)}><Heart size={13} /> Save for later</button>
                </div>
              </div>
              <strong className="cart-row-price">{formatPrice(product.price * quantity)}</strong>
            </article>
          ))}
        </section>
        {items.length > 0 && <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="subtotal-line"><span>Subtotal ({items.reduce((sum, line) => sum + line.quantity, 0)} items)</span><strong>{formatPrice(subtotal)}</strong></div>
          <PromoCodeField subtotal={subtotal} />
          {discount > 0 && <div className="subtotal-line promo-discount-line"><span>Discount ({promoCode})</span><strong>−{formatPrice(discount)}</strong></div>}
          <div className="subtotal-line"><span>Shipping</span><span className="muted">Calculated at checkout</span></div>
          <div className="subtotal-line subtotal-total"><span>Estimated subtotal</span><strong>{formatPrice(subtotal - discount)}</strong></div>
          <Link href="/checkout" className="button button-primary button-wide">Continue to checkout <ArrowRight size={15} /></Link>
          <div className="cart-perk"><ShoppingBag size={16} /><span>Your cart stays saved on this device while you browse.</span></div>
        </aside>}
      </div>
      {items.length > 0 && <div className="cart-recommendations">
        <ProductRail title="Related items" products={products.filter((product) => product.category === items[0].product.category && !items.some((line) => line.product.id === product.id)).slice(0, 8)} />
        <ProductRail title="Customers also viewed" products={products.filter((product) => product.category !== items[0].product.category && !items.some((line) => line.product.id === product.id)).slice(0, 8)} />
      </div>}
      {saveProduct && <AddToListModal product={saveProduct} onClose={() => setSaveProduct(null)} />}
    </div>
  );
}
