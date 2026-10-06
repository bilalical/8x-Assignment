"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { LockKeyhole, ShieldCheck, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { getPromoDiscount, promoErrorMessage } from "@/lib/promotions";
import { PromoCodeField } from "@/components/promo-code-field";
import type { ShippingAddress } from "@/lib/types";

const emptyAddress: ShippingAddress = { fullName: "", street: "", apartment: "", city: "", state: "", zip: "", phone: "" };

export default function CheckoutPage() {
  const { ready, address } = useStore();
  if (!ready) return <div className="checkout-page"><div className="checkout-shell"><p>Loading your order…</p></div></div>;
  return <CheckoutForm key={address?.zip ?? "new-address"} initialAddress={address} />;
}

function CheckoutForm({ initialAddress }: { initialAddress: ShippingAddress | null }) {
  const router = useRouter();
  const { cart, createOrder, promoCode, currentTime } = useStore();
  const [address, setAddress] = useState<ShippingAddress>(initialAddress ?? emptyAddress);
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvv, setCvv] = useState("123");
  const [error, setError] = useState("");
  const lines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) }))
    .filter((line): line is typeof line & { product: (typeof products)[number] } => Boolean(line.product));
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.product.price, 0);
  const promoResult = promoCode ? getPromoDiscount(promoCode, subtotal, currentTime ?? 0) : null;
  const discount = promoResult?.ok ? promoResult.discountAmount : 0;
  const taxableSubtotal = subtotal - discount;
  const tax = Number((taxableSubtotal * 0.085).toFixed(2));
  const total = taxableSubtotal + tax;

  const updateAddress = (field: keyof ShippingAddress, value: string) =>
    setAddress((previous) => ({ ...previous, [field]: value }));

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!lines.length) {
      setError("Your cart is empty. Add an item before checking out.");
      return;
    }
    if (promoResult && !promoResult.ok) {
      setError(promoErrorMessage[promoResult.error]);
      return;
    }
    const orderId = createOrder(address, card);
    if (!orderId) {
      setError("We couldn’t place your order. Please check your cart and try again.");
      return;
    }
    router.push(`/order-confirmation?order=${encodeURIComponent(orderId)}`);
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link href="/" className="checkout-brand">amazon<span className="orange-dot">.</span></Link>
        <span className="checkout-title">Secure checkout</span>
        <Link href="/cart" className="checkout-cart-link"><ShoppingCart size={19} /> Back to cart</Link>
      </header>
      <div className="checkout-shell">
        <h1 className="checkout-title-mobile">Secure checkout</h1>
        {lines.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty</h2><p>Add something you love, then come back to check out.</p>
            <Link href="/search" className="button button-primary">Explore the shop</Link>
          </div>
        ) : (
          <form className="checkout-grid" onSubmit={placeOrder}>
            <div className="checkout-main">
              <section className="checkout-section">
                <h1>1. Add a delivery address</h1>
                <p className="checkout-hint">Where should we send your order?</p>
                <div className="checkout-form-grid">
                  <label className="field field-full">Full name<input required autoComplete="name" value={address.fullName} onChange={(event) => updateAddress("fullName", event.target.value)} placeholder="Your full name" /></label>
                  <label className="field field-full">Street address<input required autoComplete="street-address" value={address.street} onChange={(event) => updateAddress("street", event.target.value)} placeholder="Street and number" /></label>
                  <label className="field field-full">Apartment, suite, etc. <span className="muted">(optional)</span><input autoComplete="address-line2" value={address.apartment} onChange={(event) => updateAddress("apartment", event.target.value)} placeholder="Apartment or unit" /></label>
                  <label className="field">City<input required autoComplete="address-level2" value={address.city} onChange={(event) => updateAddress("city", event.target.value)} /></label>
                  <label className="field">State<input required autoComplete="address-level1" value={address.state} onChange={(event) => updateAddress("state", event.target.value)} /></label>
                  <label className="field">ZIP code<input required autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" value={address.zip} onChange={(event) => updateAddress("zip", event.target.value)} /></label>
                  <label className="field">Phone number<input required autoComplete="tel" type="tel" value={address.phone} onChange={(event) => updateAddress("phone", event.target.value)} placeholder="For delivery updates" /></label>
                </div>
              </section>

              <section className="checkout-section">
                <h2>2. Payment method</h2>
                <p className="checkout-hint">Use a demo card to complete this mock checkout. No payment will be charged.</p>
                <div className="checkout-form-grid">
                  <label className="field field-full">Card number<input required inputMode="numeric" autoComplete="cc-number" pattern="[0-9 ]{13,23}" value={card} onChange={(event) => setCard(event.target.value)} /></label>
                  <label className="field">Expiration date<input required autoComplete="cc-exp" pattern="(0[1-9]|1[0-2])/[0-9]{2}" value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="MM/YY" /></label>
                  <label className="field">Security code<input required inputMode="numeric" autoComplete="cc-csc" pattern="[0-9]{3,4}" value={cvv} onChange={(event) => setCvv(event.target.value)} /></label>
                  <p className="checkout-hint field-full"><LockKeyhole size={13} /> Demo only — card details are not stored or sent.</p>
                </div>
              </section>

              <section className="checkout-section">
                <h2>3. Review your items</h2>
                <p className="checkout-hint">Your order will be delivered to {address.fullName || "your address"}.</p>
                {lines.map((line) => <div className="checkout-item" key={line.productId}>
                  <img src={`https://images.unsplash.com/${line.product.image}?auto=format&fit=crop&w=160&q=75`} alt="" />
                  <span>{line.product.title}<br /><span className="muted">Quantity: {line.quantity}</span></span>
                  <strong>{formatPrice(line.product.price * line.quantity)}</strong>
                </div>)}
              </section>
            </div>
            <aside className="checkout-summary">
              <h2>Order summary</h2>
              <div className="subtotal-line"><span>Items</span><strong>{formatPrice(subtotal)}</strong></div>
              <PromoCodeField subtotal={subtotal} />
              {discount > 0 && <div className="subtotal-line promo-discount-line"><span>Discount ({promoCode})</span><strong>−{formatPrice(discount)}</strong></div>}
              <div className="subtotal-line"><span>Shipping</span><span>FREE</span></div>
              <div className="subtotal-line"><span>Estimated tax</span><strong>{formatPrice(tax)}</strong></div>
              <div className="subtotal-line subtotal-total"><span>Order total</span><strong>{formatPrice(total)}</strong></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="button button-primary button-wide">Place your order</button>
              <p className="purchase-note"><ShieldCheck size={13} /> Mock checkout. No charge will be made.</p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
