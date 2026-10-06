import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { GiftCard } from "@/lib/gift-cards";
import { GiftCardFace } from "@/components/gift-card-face";

export function GiftCardTile({ card }: { card: GiftCard }) {
  return (
    <article className="gift-card-tile">
      <Link href={`/gift-cards/${card.id}`} className="gift-card-tile-image" aria-label={`View ${card.name}`}>
        <GiftCardFace card={card} />
      </Link>
      <div className="gift-card-tile-content">
        <Link href={`/gift-cards/${card.id}`} className="gift-card-tile-title" title={card.name}>{card.name}</Link>
        <div className="gift-card-tile-price">
          <strong>{formatPrice(card.price)}</strong>
          {card.listPrice !== undefined && <del>{formatPrice(card.listPrice)}</del>}
        </div>
      </div>
    </article>
  );
}
