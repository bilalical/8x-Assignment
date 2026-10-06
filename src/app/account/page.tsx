"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Gift, Headphones, MapPin, Package, List } from "lucide-react";
import { useStore } from "@/lib/store";

const accountCards = [
  { title: "Your Orders", description: "Track, return, or view past orders.", href: "/orders", icon: Package },
  { title: "Your Addresses", description: "Manage delivery addresses.", href: "/account/addresses", icon: MapPin },
  { title: "Payment options", description: "Manage your payment preferences.", href: "/account/payment-options", icon: CreditCard },
  { title: "Gift cards", description: "View gift card information.", href: "/account/gift-cards", icon: Gift },
  { title: "Your Lists", description: "View your saved products.", href: "/account/lists", icon: List },
  { title: "Customer Service", description: "Get help with shopping and orders.", href: "/account/customer-service", icon: Headphones },
];

export default function AccountPage() {
  const router = useRouter();
  const { ready, signedIn, accountName, signOut } = useStore();

  useEffect(() => {
    if (ready && !signedIn) router.replace("/sign-in?next=%2Faccount");
  }, [ready, signedIn, router]);

  if (!ready || !signedIn) return <div className="container page-shell"><p>Opening your account…</p></div>;

  return <div className="container page-shell account-page">
    <div className="account-page-heading"><div><p className="eyebrow">Everyday Market</p><h1 className="page-title">Your account</h1><p className="muted">Welcome, {accountName}.</p></div><button className="button button-secondary" onClick={() => { signOut(); router.replace("/"); }}>Sign out</button></div>
    <div className="account-card-grid">{accountCards.map(({ title, description, href, icon: Icon }) => <Link className="account-card" href={href} key={href}><Icon size={25} /><span><strong>{title}</strong><small>{description}</small></span></Link>)}</div>
  </div>;
}
