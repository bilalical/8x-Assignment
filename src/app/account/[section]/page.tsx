"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { ShippingAddress } from "@/lib/types";
import { formatPrice, products } from "@/lib/catalog";

const blankAddress: ShippingAddress = { fullName: "", street: "", apartment: "", city: "", state: "", zip: "", phone: "" };
const titles: Record<string, string> = {
  addresses: "Your Addresses",
  "payment-options": "Payment options",
  "gift-cards": "Gift cards",
  lists: "Your Lists",
  "customer-service": "Customer Service",
};

export default function AccountSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section;
  const title = titles[section] ?? "Account";
  const router = useRouter();
  const { ready, signedIn, address, saveAddress, lists } = useStore();
  const [addressDraft, setAddressDraft] = useState<ShippingAddress | null>(null);
  const formAddress = addressDraft ?? address ?? blankAddress;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready && !signedIn) router.replace(`/sign-in?next=${encodeURIComponent(`/account/${section}`)}`);
  }, [ready, signedIn, router, section]);

  if (!ready || !signedIn) return <div className="container page-shell"><p>Opening your account…</p></div>;

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveAddress(formAddress);
    setSaved(true);
  };
  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setSaved(false);
    setAddressDraft((previous) => ({ ...(previous ?? address ?? blankAddress), [field]: value }));
  };
  const listProducts = Object.entries(lists).flatMap(([name, ids]) => ids.map((id) => ({ name, product: products.find((product) => product.id === id) })))
    .filter((item): item is { name: string; product: (typeof products)[number] } => Boolean(item.product));

  return <div className="container page-shell account-page">
    <div className="breadcrumb"><Link href="/account">Your account</Link>　›　{title}</div>
    <h1 className="page-title">{title}</h1>
    {section === "addresses" ? <section className="account-content-card">
      <h2>{address ? "Edit your address" : "Add an address"}</h2>
      <form className="checkout-form-grid account-address-form" onSubmit={save}>
        <label className="field field-full">Full name<input required value={formAddress.fullName} onChange={(event) => updateAddress("fullName", event.target.value)} /></label>
        <label className="field field-full">Street address<input required value={formAddress.street} onChange={(event) => updateAddress("street", event.target.value)} /></label>
        <label className="field field-full">Apartment, suite, etc. (optional)<input value={formAddress.apartment} onChange={(event) => updateAddress("apartment", event.target.value)} /></label>
        <label className="field">City<input required value={formAddress.city} onChange={(event) => updateAddress("city", event.target.value)} /></label>
        <label className="field">State<input required value={formAddress.state} onChange={(event) => updateAddress("state", event.target.value)} /></label>
        <label className="field">ZIP code<input required pattern="[0-9]{5}(-[0-9]{4})?" value={formAddress.zip} onChange={(event) => updateAddress("zip", event.target.value)} /></label>
        <label className="field">Phone<input required value={formAddress.phone} onChange={(event) => updateAddress("phone", event.target.value)} /></label>
        {saved && <p className="success-message field-full" role="status">Address saved on this device.</p>}
        <button className="button button-primary" type="submit">Save address</button>
      </form>
    </section> : section === "lists" ? <section className="account-content-card">
      {listProducts.length ? <div className="account-list-items">{listProducts.map(({ name, product }) => <Link key={`${name}-${product.id}`} href={`/product/${product.id}`}><img src={`https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=160&q=75`} alt="" /><span><strong>{product.title}</strong><small>{name} · {formatPrice(product.price)}</small></span></Link>)}</div> : <p className="muted">You haven’t saved any products yet.</p>}
    </section> : section === "payment-options" ? <section className="account-content-card"><h2>Payment options</h2><p className="muted">Payment details are entered only during demo checkout and are not saved to your account.</p><Link className="button button-secondary" href="/checkout">Continue to secure checkout</Link></section>
      : section === "gift-cards" ? <section className="account-content-card"><h2>Gift cards</h2><p className="muted">Gift card balances and redemptions are not enabled in this shopping demo.</p></section>
        : section === "customer-service" ? <section className="account-content-card"><h2>How can we help?</h2><p className="muted">Browse your orders or review the shopping demo information.</p><Link className="button button-secondary" href="/orders">Go to Your Orders</Link></section>
          : <section className="account-content-card"><p>This account section is not available.</p><Link href="/account">Back to Your account</Link></section>}
    <Link href="/account" className="text-link account-back-link">Back to Your account</Link>
  </div>;
}
