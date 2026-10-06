"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";

export default function ReturnConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(params.id);
  const router = useRouter();
  const { ready, signedIn, orders } = useStore();
  const order = orders.find((item) => item.id === orderId);

  useEffect(() => {
    if (ready && !signedIn) router.replace(`/sign-in?next=${encodeURIComponent(`/returns/${orderId}/confirmation`)}`);
  }, [ready, signedIn, router, orderId]);

  if (!ready || !signedIn) return <div className="container page-shell"><p>Opening return confirmation…</p></div>;
  if (!order?.returnRequest) return <div className="container page-shell return-page"><h1 className="page-title">Return not found</h1><Link href={`/orders/${encodeURIComponent(orderId)}`}>Back to order</Link></div>;

  return <div className="container page-shell return-page">
    <div className="return-confirmation account-content-card">
      <span className="return-confirmation-icon"><Check size={28} /></span>
      <h1>Return requested</h1>
      <p>Your {order.returnRequest.resolution} request for order #{order.id} is confirmed.</p>
      <p><strong>Return authorization:</strong> {order.returnRequest.id}</p>
      <section className="return-label-placeholder"><strong>Return label</strong><span>Your printable return label will appear here.</span></section>
      <div className="return-confirmation-actions"><Link className="button button-primary" href={`/orders/${encodeURIComponent(order.id)}`}>View order</Link><Link className="button button-secondary" href="/orders">Your Orders</Link></div>
    </div>
  </div>;
}
