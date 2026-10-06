import type { GiftCard } from "@/lib/gift-cards";

export function GiftCardFace({ card, className = "" }: { card: GiftCard; className?: string }) {
  const celebration = card.category !== "brand";

  return (
    <div
      className={`gift-card-face gift-card-${card.type === "eGift" ? "egift" : "physical"} gift-card-theme-${card.id}${celebration ? " gift-card-celebration" : ""} ${className}`}
      role="img"
      aria-label={`${card.brand} ${card.type} gift card`}
    >
      {celebration && <>
        <span className="gift-card-confetti" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
        <span className="gift-card-balloons" aria-hidden="true"><i /><i /></span>
        <span className="gift-card-stars" aria-hidden="true"><i /><i /><i /></span>
      </>}
      <span className="gift-card-art-brand">{card.brand}</span>
      {celebration && <span className={`gift-card-design-label gift-card-design-${card.category}`}>{card.category.replace("-", " ")}</span>}
      {card.type === "Physical" && <span className="gift-card-notch" aria-hidden="true" />}
    </div>
  );
}
