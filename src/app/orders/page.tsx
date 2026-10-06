"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Package } from "lucide-react";
import { formatPrice, imageUrl, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";

type TimeRange = "30" | "90" | "all";

function statusLabel(status: Order["status"]) {
  return status === "processing" ? "Not yet shipped" : status[0].toUpperCase() + status.slice(1);
}

export default function OrdersPage() {
  const router = useRouter();
  const { ready, signedIn, orders } = useStore();
  const [range, setRange] = useState<TimeRange>("all");
  const [rangeReferenceTime, setRangeReferenceTime] = useState(0);

  useEffect(() => {
    if (ready && !signedIn) router.replace("/sign-in?next=%2Forders");
  }, [ready, signedIn, router]);

  const visibleOrders = useMemo(() => {
    if (range === "all") return orders;
    const days = Number(range);
    const cutoff = rangeReferenceTime - days * 24 * 60 * 60 * 1000;
    return orders.filter((order) => new Date(order.placedAt).getTime() >= cutoff);
  }, [orders, range, rangeReferenceTime]);

  if (!ready || !signedIn) return <div className="container page-shell"><p>Opening your orders…</p></div>;

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
        const orderProducts = order.items.map((line) => ({ line, product: products.find((product) => product.id === line.productId) }))
          .filter((item): item is typeof item & { product: (typeof products)[number] } => Boolean(item.product));
        return <article className="order-card" key={order.id}>
          <header className="order-card-header">
            <div><small>ORDER PLACED</small><strong>{new Date(order.placedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></div>
            <div><small>TOTAL</small><strong>{formatPrice(order.total)}</strong></div>
            <div><small>SHIP TO</small><strong>{order.address.fullName}</strong></div>
            <div className="order-number"><small>ORDER # {order.id}</small><Link href={`/orders/${encodeURIComponent(order.id)}`}>View order details <ChevronRight size={13} /></Link></div>
          </header>
          <div className="order-card-body">
            <div className="order-status"><Package size={17} /><strong>{statusLabel(order.status)}</strong>{order.status === "delivered" && <span>Delivered</span>}</div>
            <div className="order-card-items">
              {orderProducts.map(({ line, product }) => <Link className="order-item-thumb" key={line.productId} href={`/product/${product.id}`} title={`${line.quantity} × ${product.title}`}>
                <img src={imageUrl(product.image, 180)} alt={product.title} /><span>{line.quantity} × {product.title}</span>
              </Link>)}
            </div>
            <Link className="button button-secondary order-details-button" href={`/orders/${encodeURIComponent(order.id)}`}>View order</Link>
          </div>
        </article>;
      })}
      {!visibleOrders.length && <div className="empty-state"><h2>No orders in this time range</h2><p>Try another range or continue shopping.</p><Link className="button button-primary" href="/search">Explore the shop</Link></div>}
    </div>
  </div>;
}
