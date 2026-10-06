"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { getPromoDiscount, promoErrorMessage } from "@/lib/promotions";

export function PromoCodeField({ subtotal }: { subtotal: number }) {
  const { promoCode, currentTime, applyPromoCode, removePromoCode } = useStore();
  const [enteredCode, setEnteredCode] = useState("");
  const [message, setMessage] = useState("");
  const appliedPromo = promoCode ? getPromoDiscount(promoCode, subtotal, currentTime ?? 0) : null;

  const apply = () => {
    const result = applyPromoCode(enteredCode);
    if (result.ok) {
      setEnteredCode("");
      setMessage("");
    } else {
      setMessage(promoErrorMessage[result.error]);
    }
  };

  return <div className="promo-code-field">
    <div className="promo-code-form">
      <label htmlFor="promo-code">Promo code</label>
      <div className="promo-code-entry">
        <input id="promo-code" value={enteredCode} onChange={(event) => { setEnteredCode(event.target.value); setMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); apply(); } }} placeholder="Enter code" autoComplete="off" />
        <button className="button button-secondary" type="button" onClick={apply} disabled={!enteredCode.trim()}>Apply</button>
      </div>
    </div>
    {promoCode && <div className={`promo-applied${appliedPromo?.ok ? "" : " promo-invalid"}`} role={appliedPromo?.ok ? "status" : "alert"}>
      <span>{appliedPromo?.ok ? `${promoCode} applied` : promoErrorMessage[appliedPromo?.error ?? "invalid"]}</span>
      <button type="button" className="link-button" onClick={() => { removePromoCode(); setMessage(""); }}>Remove</button>
    </div>}
    {message && <p className="promo-message" role="alert">{message}</p>}
  </div>;
}
