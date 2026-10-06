"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { formatPrice, imageUrl, products } from "@/lib/catalog";
import { GiftCardFace } from "@/components/gift-card-face";
import { giftCards } from "@/lib/gift-cards";
import { isGiftCardLine } from "@/lib/types";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";

type TimeRange = "30" | "90" | "all";

function statusLabel(status: Order["status"]) {
  switch (status) {
    case "processing": return "Not yet shipped";
    case "shipped": return "Shipped";
    case "delivered": return "Delivered";
    case "cancelled": return "Cancelled";
    default: return "Status unavailable";
  }
}

export default function OrdersPage() {
  const { ready, orders, signedIn } = useStore();
  const [range, setRange] = useState<TimeRange>("all");
  const [rangeReferenceTime, setRangeReferenceTime] = useState(0);

  const visibleOrders = useMemo(() => {
    const newestFirst = [...orders].sort((first, second) => new Date(second.placedAt).getTime() - new Date(first.placedAt).getTime());
    if (range === "all") return newestFirst;
    const days = Number(range);
    const cutoff = rangeReferenceTime - days * 24 * 60 * 60 * 1000;
    return newestFirst.filter((order) => new Date(order.placedAt).getTime() >= cutoff);
  }, [orders, range, rangeReferenceTime]);

  if (!ready) return <OrdersLoadingSkeleton />;
  if (!signedIn) return <div className="container page-shell orders-page">
    <h1 className="page-title">Your Orders</h1>
    <p className="muted">Sign in to view your order history.</p>
    <Link className="button button-primary" href="/sign-in?next=%2Forders">Sign in</Link>
  </div>;

  return <div className="container page-shell orders-page">
    <div className="breadcrumb"><Link href="/account">Your account</Link>　›　Your Orders</div>
    <div className="orders-heading"><div><h1 className="page-title">Your Orders</h1><p className="muted">Review order details, track shipments, and start returns.</p></div>
      <label className="orders-range">Time range{" "}
        <select className="sort-select" value={range} onChange={(event) => { setRangeReferenceTime(Date.now()); setRange(event.target.value as TimeRange); }}>
          <option value="30">Last 30 days</option><option value="90">Last 3 months</option><option value="all">All orders</option>
        </select>
      </label>
    </div>
    <div className="orders-list">
      {visibleOrders.map((order) => {
        return <article className="order-card" key={order.id}>
          <header className="order-card-header">
            <div><small>ORDER PLACED</small><strong>{new Date(order.placedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></div>
            <div><small>TOTAL</small><strong>{formatPrice(order.total)}</strong></div>
            <div><small>{order.address.fullName ? "SHIP TO" : "DELIVERY"}</small><strong>{order.address.fullName || "Digital gift card"}</strong></div>
            <div className="order-number"><small>ORDER # {order.id}</small><Link href={`/orders/${encodeURIComponent(order.id)}`}>View order details <ChevronRight size={13} /></Link></div>
          </header>
          <div className="order-card-body">
            <div className="order-status"><Package size={17} /><strong>{order.returnRequest ? "Return requested" : statusLabel(order.status)}</strong>{order.status === "delivered" && !order.returnRequest && <span>Delivered</span>}</div>
            <div className="order-card-items">
              {order.items.map((line) => {
                if (isGiftCardLine(line)) {
                  const giftCard = giftCards.find((card) => card.id === line.giftCardId);
                  return giftCard ? <Link className="order-item-thumb gift-order-item-thumb" key={line.lineId} href={`/gift-cards/${giftCard.id}`} title={`${giftCard.name}, ${formatPrice(line.amount)}`}>
                    <GiftCardFace card={giftCard} /><span>{giftCard.name} · {formatPrice(line.amount)}{line.recipientName ? ` for ${line.recipientName}` : ""}</span>
                  </Link> : null;
                }
                const product = products.find((item) => item.id === line.productId);
                return product ? <Link className="order-item-thumb" key={line.productId} href={`/product/${product.id}`} title={`${line.quantity} × ${product.title}`}>
                  <img src={imageUrl(product.image, 180)} alt={product.title} /><span>{line.quantity} × {product.title}</span>
                </Link> : null;
              })}
            </div>
            <Link className="button button-secondary order-details-button" href={`/orders/${encodeURIComponent(order.id)}`}>View order</Link>
          </div>
        </article>;
      })}
      {!visibleOrders.length && <div className="empty-state"><h2>{orders.length ? "No orders in this time range" : "You haven’t placed any orders yet"}</h2><p>{orders.length ? "Try another range or continue shopping." : "When you place an order, it will appear here."}</p><Link className="button button-primary" href="/search">Continue shopping</Link></div>}
    </div>
  </div>;
}

function OrdersLoadingSkeleton() {
  return <div className="container page-shell orders-page orders-loading" aria-busy="true" aria-label="Loading your orders">
    <div className="orders-skeleton-title" />
    <div className="orders-list">
      {[0, 1, 2].map((item) => <div className="order-skeleton-card" key={item}>
        <div className="order-skeleton-header"><i /><i /><i /><i /></div>
        <div className="order-skeleton-body"><i /><div className="order-skeleton-thumbnails"><i /><i /><i /></div></div>
      </div>)}
    </div>
  </div>;
}
