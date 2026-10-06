"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/catalog";
import type { GiftCard } from "@/lib/gift-cards";
import { GiftCardFace } from "@/components/gift-card-face";
import { useStore } from "@/lib/store";

const presetAmounts = [10, 25, 50, 100];

export function GiftCardDetail({ card }: { card: GiftCard }) {
  const router = useRouter();
  const { addGiftCardToCart } = useStore();
  const [amount, setAmount] = useState(card.price);
  const [customAmount, setCustomAmount] = useState("");
  const [customSelected, setCustomSelected] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedAmount = customSelected ? Number(customAmount) : amount;

  const addToCart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!Number.isInteger(selectedAmount) || selectedAmount < 5 || selectedAmount > 500) {
      setError("Choose a whole-dollar amount from $5 to $500.");
      return;
    }
    if (card.type === "eGift" && (!recipientName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim()))) {
      setError("Enter a recipient name and a valid email address.");
      return;
    }

    addGiftCardToCart({
      giftCardId: card.id,
      amount: selectedAmount,
      ...(card.type === "eGift" ? {
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        ...(message.trim() ? { message: message.trim() } : {}),
      } : {}),
    });
    router.push("/cart");
  };

  return (
    <section className="gift-card-detail">
      <div className="gift-card-detail-preview"><GiftCardFace card={card} /></div>
      <div className="gift-card-detail-copy">
        <p className="product-category-line">{card.brand} <span>·</span> {card.type}</p>
        <h1>{card.name}</h1>
        <p className="muted">Choose an amount and send a little joy.</p>
        <form className="gift-card-detail-form" onSubmit={addToCart}>
          <fieldset className="gift-card-amounts">
            <legend>Choose an amount</legend>
            {presetAmounts.map((preset) => (
              <label key={preset} className={`gift-card-amount-option${!customSelected && amount === preset ? " selected" : ""}`}>
                <input type="radio" name="gift-card-amount" checked={!customSelected && amount === preset} onChange={() => { setCustomSelected(false); setAmount(preset); }} />
                {formatPrice(preset)}
              </label>
            ))}
            <label className={`gift-card-amount-option gift-card-custom-option${customSelected ? " selected" : ""}`}>
              <input type="radio" name="gift-card-amount" checked={customSelected} onChange={() => setCustomSelected(true)} />
              Custom
            </label>
          </fieldset>
          {customSelected && <label className="field">Custom amount ($5–$500)
            <input
              aria-label="Custom gift card amount in dollars"
              type="number"
              min={5}
              max={500}
              step={1}
              required
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Enter whole dollars"
            />
          </label>}
          {card.type === "eGift" && <>
            <label className="field">Recipient name
              <input required maxLength={100} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} autoComplete="name" />
            </label>
            <label className="field">Recipient email
              <input required type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} autoComplete="email" />
            </label>
            <label className="field">Message <span className="muted">(optional)</span>
              <textarea maxLength={200} value={message} onChange={(event) => setMessage(event.target.value)} rows={4} />
              <span className="gift-card-message-count" aria-live="polite">{message.length}/200 characters</span>
            </label>
          </>}
          {card.type === "Physical" && <p className="checkout-hint">This physical gift card will be shipped with your order.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit">Add to cart · {formatPrice(selectedAmount || 0)}</button>
          <p className="purchase-note">Mock gift card. No payment is collected.</p>
        </form>
      </div>
    </section>
  );
}
