"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatPrice, imageUrl, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { isGiftCardLine } from "@/lib/types";
import type { ProductCartLine } from "@/lib/types";

const reasons = [
  "No longer needed",
  "Item arrived too late",
  "Item defective or does not work",
  "Item damaged",
  "Item not as described",
  "Wrong item was sent",
];

export default function ReturnRequestPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(params.id);
  const router = useRouter();
  const { ready, signedIn, currentTime, orders, requestReturn } = useStore();
  const order = orders.find((item) => item.id === orderId);
  const [selected, setSelected] = useState<ProductCartLine[]>([]);
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState<"refund" | "replacement">("refund");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !signedIn) router.replace(`/sign-in?next=${encodeURIComponent(`/returns/${orderId}`)}`);
  }, [ready, signedIn, router, orderId]);

  if (!ready || !signedIn) return <div className="container page-shell"><p>Opening return options…</p></div>;
  if (!order) return <div className="container page-shell"><h1 className="page-title">Order not found</h1><Link href="/orders">Back to Your Orders</Link></div>;

  const withinWindow = currentTime !== null && currentTime - new Date(order.placedAt).getTime() >= 0 &&
    currentTime - new Date(order.placedAt).getTime() <= 30 * 24 * 60 * 60 * 1000;
  if (order.status !== "delivered" || order.returnRequest || !withinWindow) {
    return <div className="container page-shell return-page"><h1 className="page-title">Return unavailable</h1>
      <p className="muted">{order.returnRequest ? "A return has already been requested for this order." : "Return window closed"}</p>
      <Link className="button button-secondary" href={`/orders/${encodeURIComponent(order.id)}`}>Back to order</Link></div>;
  }

  const toggleItem = (line: ProductCartLine, checked: boolean) => {
    setSelected((previous) => checked
      ? [...previous.filter((item) => item.productId !== line.productId), line]
      : previous.filter((item) => item.productId !== line.productId));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected.length) {
      setError("Select at least one item to continue.");
      return;
    }
    if (!reason) {
      setError("Choose a reason for the return.");
      return;
    }
    if (requestReturn(order.id, { items: selected, reason, resolution })) {
      router.push(`/returns/${encodeURIComponent(order.id)}/confirmation`);
    } else {
      setError("We could not submit this return. The order may no longer be eligible.");
    }
  };

  return <div className="container page-shell return-page">
    <div className="breadcrumb"><Link href="/orders">Your Orders</Link>　›　<Link href={`/orders/${encodeURIComponent(order.id)}`}>Order details</Link>　›　Return items</div>
    <h1 className="page-title">Return or replace items</h1>
    <p className="muted">Order #{order.id}. Select the items you want to return.</p>
    <form className="return-form account-content-card" onSubmit={submit}>
      <fieldset className="return-item-list"><legend>Choose items</legend>
        {order.items.map((line) => {
          if (isGiftCardLine(line)) return null;
          const product = products.find((item) => item.id === line.productId);
          if (!product) return null;
          return <label className="return-item" key={line.productId}>
            <input type="checkbox" checked={selected.some((item) => item.productId === line.productId)} onChange={(event) => toggleItem(line, event.target.checked)} />
            <img src={imageUrl(product.image, 180)} alt="" />
            <span><strong>{product.title}</strong><small>Quantity: {line.quantity} · {formatPrice(product.price * line.quantity)}</small></span>
          </label>;
        })}
      </fieldset>
      <label className="form-field"><span>Reason for return</span>
        <select value={reason} onChange={(event) => setReason(event.target.value)} required>
          <option value="">Select a reason</option>{reasons.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <fieldset className="return-resolution"><legend>How can we help?</legend>
        <label><input type="radio" name="resolution" value="refund" checked={resolution === "refund"} onChange={() => setResolution("refund")} /> Refund</label>
        <label><input type="radio" name="resolution" value="replacement" checked={resolution === "replacement"} onChange={() => setResolution("replacement")} /> Replacement</label>
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="button button-primary">Confirm return</button>
    </form>
  </div>;
}
