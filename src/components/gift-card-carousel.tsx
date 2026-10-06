"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GiftCard } from "@/lib/gift-cards";
import { GiftCardTile } from "@/components/gift-card-tile";

export function GiftCardCarousel({ title, cards, group }: { title: string; cards: GiftCard[]; group: "celebration" | "brands" }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => rowRef.current?.scrollBy({ left: direction * 330, behavior: "smooth" });

  return (
    <section className="gift-card-section">
      <div className="gift-card-section-heading">
        <h2>{title}</h2>
        <Link className="text-link" href={`/gift-cards?group=${group}`}>Shop all</Link>
      </div>
      <div className="gift-card-carousel-wrap">
        <button className="gift-card-carousel-arrow gift-card-carousel-prev" type="button" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}><ChevronLeft size={21} /></button>
        <div
          className="gift-card-carousel"
          ref={rowRef}
          tabIndex={0}
          aria-label={`${title} gift cards`}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              scroll(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          {cards.map((card) => <GiftCardTile key={card.id} card={card} />)}
        </div>
        <button className="gift-card-carousel-arrow gift-card-carousel-next" type="button" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}><ChevronRight size={21} /></button>
      </div>
    </section>
  );
}
