"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, ShoppingCart } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const quickSearches = ["wireless headphones", "coffee maker", "desk lamp", "water bottle"];

export function SiteHeader() {
  const router = useRouter();
  const { cart } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [focused, setFocused] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const suggestions = query.trim()
    ? products.filter((product) =>
        `${product.title} ${product.brand} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase()),
      ).slice(0, 5)
    : [];
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  const submit = (value = query) => {
    const trimmed = value.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}${category !== "All" ? `&category=${encodeURIComponent(category)}` : ""}` : "/search");
    setFocused(false);
  };

  return (
    <header className="site-header">
      <div className="header-main">
        <Link aria-label="Everyday Market home" href="/" className="brand-mark">
          <span>amazon</span><i />
        </Link>
        <button className="delivery-location" aria-label="Delivery location">
          <MapPin size={18} />
          <span><small>Deliver to Muhammad</small><strong>Seattle 98101</strong></span>
        </button>
        <div className="search-wrap">
          <div className="search-box">
            <button
              className="search-department"
              type="button"
              aria-expanded={categoryOpen}
              onClick={() => setCategoryOpen(!categoryOpen)}
            >
              {category === "All" ? "All" : category}<ChevronDown size={13} />
            </button>
            {categoryOpen && (
              <div className="department-menu">
                {["All", ...categories].map((item) => (
                  <button type="button" key={item} onClick={() => { setCategory(item); setCategoryOpen(false); }}>
                    {item}
                  </button>
                ))}
              </div>
            )}
            <form
              className="search-form"
              action="/search"
              onSubmit={(event) => { event.preventDefault(); submit(); }}
            >
              <input
                aria-label="Search Everyday Market"
                placeholder="Search Everyday Market"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => window.setTimeout(() => setFocused(false), 150)}
                autoComplete="off"
              />
              <button aria-label="Search" type="submit" className="search-submit"><Search size={23} /></button>
            </form>
            {focused && (suggestions.length > 0 || !query.trim()) && (
              <div className="suggestion-menu">
                {suggestions.length > 0 ? suggestions.map((product) => (
                  <button type="button" className="suggestion-item" key={product.id} onMouseDown={() => router.push(`/product/${product.id}`)}>
                    <span className="suggestion-icon"><Search size={15} /></span>
                    <span>{product.title}</span>
                  </button>
                )) : quickSearches.map((item) => (
                  <button type="button" className="suggestion-item suggestion-quick" key={item} onMouseDown={() => { setQuery(item); submit(item); }}>
                    <Search size={15} /><span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className="header-account" onClick={() => router.push("/cart")}>
          <small>Hello, Muhammad</small><strong>Account &amp; Lists <ChevronDown size={12} /></strong>
        </button>
        <Link className="header-orders" href="/cart"><small>Returns</small><strong>&amp; Orders</strong></Link>
        <Link className="cart-link" href="/cart" aria-label={`Cart, ${count} items`}>
          <span className="cart-icon"><ShoppingCart size={30} /><b>{count}</b></span><strong>Cart</strong>
        </Link>
      </div>
      <nav className="header-nav" aria-label="Main navigation">
        <Link href="/search?q=All">☰ <span>All</span></Link>
        <Link href="/search?q=Deals">Today’s deals</Link>
        <Link href="/search?q=Home">Home</Link>
        <Link href="/search?q=Kitchen">Kitchen</Link>
        <Link href="/search?q=Electronics">Electronics</Link>
        <Link href="/search?q=Fashion">Fashion</Link>
        <Link href="/search?q=Books">Books</Link>
        <Link href="/search?q=Beauty">Beauty &amp; care</Link>
        <Link href="/cart">Your cart</Link>
      </nav>
    </header>
  );
}
