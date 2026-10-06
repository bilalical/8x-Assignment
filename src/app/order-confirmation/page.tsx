"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice, products } from "@/lib/catalog";
import { Check, PackageCheck } from "lucide-react";

export default function OrderConfirmationPage() {
  const { orders, ready } = useStore();
  const order = orders[0];

  if (!ready) return <div className="order-confirmation"><p>Preparing your order confirmation…</p></div>;
  if (!order) return <div className="order-confirmation"><h1>No order to show yet</h1><p>Your next favorite find is only a few clicks away.</p><Link className="button button-primary" href="/search">Explore the shop</Link></div>;

  return (
    <section className="order-confirmation">
      <div className="order-success-icon"><Check size={31} /></div>
      <span className="eyebrow"><PackageCheck size={14} /> All set</span>
      <h1>Thank you for your order.</h1>
      <p>Your order is in. We’ve saved the details right here on this device.</p>
      <div className="order-details">
        <div><span>Order number</span><strong>{order.id}</strong></div>
        <div><span>Placed</span><strong>{new Date(order.placedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></div>
        <div><span>Order total</span><strong>{formatPrice(order.total)}</strong></div>
        <div><span>Payment</span><strong>Card ending in {order.lastFour}</strong></div>
        <div><span>Delivering to</span><strong>{order.address.fullName}, {order.address.city}</strong></div>
      </div>
      <p className="checkout-hint">A mock order was saved locally. No payment was collected.</p>
      <Link className="button button-primary" href="/search">Continue shopping</Link>
      <Link className="button button-secondary" href="/">Back to home</Link>
      <div className="order-contents">{order.items.map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product ? <p key={line.productId}>{line.quantity} × {product.title}</p> : null;
      })}</div>
    </section>
  );
}
