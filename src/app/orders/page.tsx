import Link from "next/link";

export default function OrdersPage() {
  return <div className="container page-shell">
    <div className="breadcrumb"><Link href="/account">Your account</Link>　›　Your Orders</div>
    <h1 className="page-title">Your Orders</h1>
    <section className="account-content-card"><p>Your order history will appear here.</p><Link className="button button-secondary" href="/search">Continue shopping</Link></section>
  </div>;
}
