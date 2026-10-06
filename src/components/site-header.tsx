"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, CircleUserRound, MapPin, Menu, Search, ShoppingCart, X } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const quickSearches = ["wireless headphones", "coffee maker", "desk lamp", "water bottle"];

export function SiteHeader() {
  const router = useRouter();
  const { cart, lists } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [focused, setFocused] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const suggestions = query.trim()
    ? products.filter((product) =>
        `${product.title} ${product.brand} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase()),
      ).slice(0, 5)
    : [];
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
        <div className="account-menu-wrap" ref={accountRef}>
          <button className="header-account" aria-label="Account and lists" aria-expanded={accountOpen} aria-controls="account-menu" onClick={() => { setAccountOpen(!accountOpen); setAccountMessage(""); }}>
            <CircleUserRound className="account-icon" size={24} />
            <span className="account-copy"><small>Hello, Muhammad</small><strong>Account &amp; Lists <ChevronDown size={12} /></strong></span>
          </button>
          {accountOpen && <div className="account-menu" id="account-menu" role="menu">
            <button role="menuitem" onClick={() => setAccountMessage("Sign-in is not available in this local demo.")}>Sign in</button>
            <Link role="menuitem" href="/cart" onClick={() => setAccountOpen(false)}>Your account</Link>
            <Link role="menuitem" href="/order-confirmation" onClick={() => setAccountOpen(false)}>Returns &amp; Orders</Link>
            <button role="menuitem" aria-expanded={listsOpen} onClick={() => setListsOpen(!listsOpen)}>Your lists <ChevronDown size={14} /></button>
            {listsOpen && <div className="account-lists">
              {Object.entries(lists).map(([name, ids]) => (
                <section key={name}><strong>{name} <span>({ids.length})</span></strong>
                  {ids.length ? ids.map((id) => {
                    const product = products.find((item) => item.id === id);
                    return product ? <Link key={id} href={`/product/${id}`} onClick={() => setAccountOpen(false)}>{product.title}</Link> : null;
                  }) : <small>No saved items yet</small>}
                </section>
              ))}
            </div>}
            {accountMessage && <p className="account-menu-note" role="status">{accountMessage}</p>}
          </div>}
        </div>
        <Link className="header-orders" href="/order-confirmation"><small>Returns</small><strong>&amp; Orders</strong></Link>
        <Link className="cart-link" href="/cart" aria-label={`Cart, ${count} items`}>
          <span className="cart-icon"><ShoppingCart size={30} />{count > 0 && <b key={count}>{count > 99 ? "99+" : count}</b>}</span><strong>Cart</strong>
        </Link>
      </div>
      <nav className={`header-nav${mobileMenuOpen ? " header-nav-open" : ""}`} aria-label="Main navigation">
        <button className="mobile-menu-toggle" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />} {mobileMenuOpen ? "Close menu" : "Menu"}
        </button>
        <div className="header-nav-links" onClick={() => setMobileMenuOpen(false)}>
          <Link href="/search?q=All">☰ <span>All</span></Link>
          <Link href="/search?q=Deals">Today’s deals</Link>
          <Link href="/search?q=Home">Home</Link>
          <Link href="/search?q=Kitchen">Kitchen</Link>
          <Link href="/search?q=Electronics">Electronics</Link>
          <Link href="/search?q=Fashion">Fashion</Link>
          <Link href="/search?q=Books">Books</Link>
          <Link href="/search?q=Beauty">Beauty &amp; care</Link>
          <Link href="/cart">Your cart</Link>
          <Link className="mobile-orders-link" href="/order-confirmation">Returns &amp; Orders</Link>
        </div>
      </nav>
    </header>
  );
}
