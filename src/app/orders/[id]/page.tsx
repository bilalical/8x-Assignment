"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Package, Truck } from "lucide-react";
import { formatPrice, imageUrl, products } from "@/lib/catalog";
import { GiftCardFace } from "@/components/gift-card-face";
import { giftCards } from "@/lib/gift-cards";
import { isGiftCardLine } from "@/lib/types";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";

const steps: { key: Order["status"]; label: string }[] = [
  { key: "processing", label: "Order placed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(params.id);
  const { ready, currentTime, orders, cancelOrder } = useStore();
  const [actionMessage, setActionMessage] = useState("");
  const order = orders.find((item) => item.id === orderId);

  if (!ready) return <div className="container page-shell order-detail-loading" aria-busy="true"><p>Loading order details…</p></div>;
  if (!order) return <div className="container page-shell"><h1 className="page-title">Order not found</h1><p className="muted">This order may not be saved on this device.</p><Link className="button button-secondary" href="/orders">Back to Your Orders</Link></div>;

  const cancelled = order.status === "cancelled";
  const reachedStep = steps.findIndex((step) => step.key === order.status);
  const hasReturnableItems = order.items.some((line) => !isGiftCardLine(line));

  return <div className="container page-shell order-details-page">
    <div className="breadcrumb"><Link href="/orders">Your Orders</Link>　›　Order details</div>
    <div className="order-details-heading"><div><h1 className="page-title">Order details</h1><p className="muted">Order #{order.id} · {new Date(order.placedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div><Link href="/orders" className="button button-secondary">Back to orders</Link></div>
    <div className="order-timeline" aria-label="Order status timeline">
      {cancelled ? <div className="order-timeline-step current"><span><XMark /></span><strong>Cancelled</strong></div> : steps.map((step, index) => {
        const done = reachedStep >= index;
        const current = order.status === step.key;
        const Icon = index === 0 ? Check : index === 1 ? Truck : Package;
        return <div className={`order-timeline-step${done ? " done" : ""}${current ? " current" : ""}`} key={step.key}>
          <span><Icon size={16} /></span><strong>{step.label}</strong>
          {index < steps.length - 1 && <i className={reachedStep > index ? "complete" : ""} />}
        </div>;
      })}
    </div>
    {order.returnRequest && <div className="return-status-note"><strong>Return requested</strong><span>{order.returnRequest.resolution === "refund" ? "Refund" : "Replacement"} · {order.returnRequest.reason}</span><Link href={`/returns/${encodeURIComponent(order.id)}/confirmation`}>View return confirmation</Link></div>}
    {actionMessage && <p className="success-message order-action-message" role="status">{actionMessage}</p>}
    <div className="order-details-grid">
      <section className="account-content-card order-detail-items"><h2>Items in this order</h2>
        {order.items.map((line) => {
          if (isGiftCardLine(line)) {
            const giftCard = giftCards.find((item) => item.id === line.giftCardId);
            return giftCard ? <article className="order-detail-item gift-order-detail-item" key={line.lineId}>
              <GiftCardFace card={giftCard} />
              <div><Link href={`/gift-cards/${giftCard.id}`}><strong>{giftCard.name}</strong></Link><span>{giftCard.type} · {formatPrice(line.amount)}</span>{line.recipientName && <span>For {line.recipientName} · {line.recipientEmail}</span>}{line.message && <span>Message: “{line.message}”</span>}<strong>{formatPrice(line.amount * line.quantity)}</strong></div>
            </article> : null;
          }
          const product = products.find((item) => item.id === line.productId);
          return product ? <article className="order-detail-item" key={product.id}>
            <img src={imageUrl(product.image, 240)} alt={product.title} />
            <div><Link href={`/product/${product.id}`}><strong>{product.title}</strong></Link><span>Quantity: {line.quantity}</span><strong>{formatPrice(product.price * line.quantity)}</strong></div>
          </article> : null;
        })}
      </section>
      <aside className="order-detail-side">
        {hasReturnableItems && order.status === "delivered" && !order.returnRequest && <section className="account-content-card">
          <h2>Returns</h2>
          {currentTime !== null && currentTime - new Date(order.placedAt).getTime() >= 0 && currentTime - new Date(order.placedAt).getTime() <= 30 * 24 * 60 * 60 * 1000
            ? <Link className="button button-secondary button-wide" href={`/returns/${encodeURIComponent(order.id)}`}>Return or replace items</Link>
            : <p className="muted">Return window closed</p>}
        </section>}
        {hasReturnableItems && order.status === "processing" && <section className="account-content-card">
          <h2>Order actions</h2><button className="button button-secondary" onClick={() => setActionMessage(cancelOrder(order.id) ? "This order has been cancelled." : "This order can no longer be cancelled.")}>Cancel order</button>
        </section>}
        {order.address.fullName && <section className="account-content-card"><h2>Shipping address</h2><address>{order.address.fullName}<br />{order.address.street}{order.address.apartment && <><br />{order.address.apartment}</>}<br />{order.address.city}, {order.address.state} {order.address.zip}<br />{order.address.phone}</address></section>}
        <section className="account-content-card"><h2>Payment summary</h2>
          <div className="subtotal-line"><span>Items</span><strong>{formatPrice(order.subtotal)}</strong></div>
          {order.discountAmount ? <div className="subtotal-line"><span>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</span><strong>−{formatPrice(order.discountAmount)}</strong></div> : null}
          <div className="subtotal-line"><span>Estimated tax</span><strong>{formatPrice(order.tax)}</strong></div>
          <div className="subtotal-line"><span>Payment method</span><strong>Card ending in {order.lastFour}</strong></div>
          <div className="subtotal-line subtotal-total"><span>Order total</span><strong>{formatPrice(order.total)}</strong></div>
        </section>
      </aside>
    </div>
  </div>;
}

function XMark() {
  return <span aria-hidden="true">×</span>;
}
