import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftCardDetail } from "@/components/gift-card-detail";
import { giftCards } from "@/lib/gift-cards";

export function generateStaticParams() {
  return giftCards.map((card) => ({ id: card.id }));
}

export default async function GiftCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = giftCards.find((item) => item.id === id);
  if (!card) notFound();

  return <div className="container page-shell gift-card-detail-page">
    <div className="breadcrumb"><Link href="/">Home</Link>　›　<Link href="/gift-cards">The Gift Card Shop</Link>　›　{card.name}</div>
    <GiftCardDetail card={card} />
  </div>;
}
