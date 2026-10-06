"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatPrice, products } from "@/lib/catalog";
import { giftCards } from "@/lib/gift-cards";
import { isGiftCardLine } from "@/lib/types";
import { Check, PackageCheck } from "lucide-react";

export default function OrderConfirmationPage() {
  return <Suspense fallback={<div className="order-confirmation"><p>Preparing your order confirmation…</p></div>}>
    <OrderConfirmationContent />
  </Suspense>;
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, ready } = useStore();
  const orderId = searchParams.get("order");
  const order = orders.find((item) => item.id === orderId);

  useEffect(() => {
    if (ready && !orderId) router.replace("/orders");
  }, [ready, orderId, router]);

  if (!ready) return <div className="order-confirmation"><p>Preparing your order confirmation…</p></div>;
  if (!order) return <section className="order-confirmation"><h1>Order not found</h1><p>This confirmation is unavailable. Your order history is still here.</p><Link className="button button-primary" href="/orders">Your Orders</Link></section>;

  return (
    <section className="order-confirmation">
      <div className="order-success-icon"><Check size={31} /></div>
      <span className="eyebrow"><PackageCheck size={14} /> All set</span>
      <h1>Thank you for your order.</h1>
      <p>Your order is in. We’ve saved the details right here on this device.</p>
      <div className="order-details">
        <div><span>Order number</span><strong>{order.id}</strong></div>
        <div><span>Placed</span><strong>{new Date(order.placedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></div>
        {order.discountAmount ? <div><span>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</span><strong>−{formatPrice(order.discountAmount)}</strong></div> : null}
        <div><span>Order total</span><strong>{formatPrice(order.total)}</strong></div>
        <div><span>Payment</span><strong>Card ending in {order.lastFour}</strong></div>
        {order.address.fullName && <div><span>Delivering to</span><strong>{order.address.fullName}, {order.address.city}</strong></div>}
      </div>
      <p className="checkout-hint">A mock order was saved locally. No payment was collected.</p>
      <Link className="button button-primary" href="/search">Continue shopping</Link>
      <Link className="button button-secondary" href={`/orders/${encodeURIComponent(order.id)}`}>View order details</Link>
      <Link className="button button-secondary" href="/">Back to home</Link>
      <div className="order-contents">{order.items.map((line) => {
        if (isGiftCardLine(line)) {
          const giftCard = giftCards.find((item) => item.id === line.giftCardId);
          return giftCard ? <p key={line.lineId}>{giftCard.name} · {formatPrice(line.amount)}{line.recipientName ? ` for ${line.recipientName} (${line.recipientEmail})` : ""}</p> : null;
        }
        const product = products.find((item) => item.id === line.productId);
        return product ? <p key={line.productId}>{line.quantity} × {product.title}</p> : null;
      })}</div>
    </section>
  );
}
