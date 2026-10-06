import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GiftCardCarousel } from "@/components/gift-card-carousel";
import { GiftCardTile } from "@/components/gift-card-tile";
import { celebrationCategories, giftCards } from "@/lib/gift-cards";

export const metadata: Metadata = { title: "The Gift Card Shop" };

type GiftCardShopPageProps = {
  searchParams: Promise<{ group?: string }>;
};

export default async function GiftCardShopPage({ searchParams }: GiftCardShopPageProps) {
  const { group } = await searchParams;
  if (group && group !== "celebration" && group !== "brands") notFound();

  if (group) {
    const cards = group === "celebration"
      ? giftCards.filter((card) => card.category !== "brand")
      : giftCards.filter((card) => card.category === "brand");
    return <div className="container page-shell gift-card-shop">
      <div className="breadcrumb"><Link href="/">Home</Link>　›　<Link href="/gift-cards">The Gift Card Shop</Link>　›　{group === "celebration" ? "Time to celebrate!" : "Customers love these gift cards"}</div>
      <div className="gift-card-shop-heading"><h1 className="page-title">{group === "celebration" ? "Time to celebrate!" : "Customers love these gift cards"}</h1><p className="muted">Find a gift card for someone special.</p></div>
      <div className="gift-card-grid">{cards.map((card) => <GiftCardTile key={card.id} card={card} />)}</div>
    </div>;
  }

  const brandCards = giftCards.filter((card) => card.category === "brand");
  return <div className="container page-shell gift-card-shop">
    <div className="breadcrumb"><Link href="/">Home</Link>　›　The Gift Card Shop</div>
    <header className="gift-card-shop-heading">
      <span className="eyebrow">A little something for everyone</span>
      <h1 className="page-title">The Gift Card Shop</h1>
      <p className="muted">Celebrate the people and moments that matter with a gift they can choose for themselves.</p>
    </header>
    <GiftCardCarousel
      title="Time to celebrate!"
      cards={celebrationCategories.map(({ id }) => giftCards.find((card) => card.category === id)!).filter(Boolean)}
      group="celebration"
    />
    <GiftCardCarousel title="Customers love these gift cards" cards={brandCards} group="brands" />
  </div>;
}
