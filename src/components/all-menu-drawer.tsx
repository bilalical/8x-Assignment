"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleUserRound, X } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const departmentSubcategories: Record<string, string[]> = {
  Electronics: ["Headphones", "Speakers", "Chargers", "Storage", "Accessories"],
  Home: ["Lighting", "Bedding", "Decor", "Furniture", "Storage"],
  Kitchen: ["Cookware", "Coffee & tea", "Tableware", "Kitchen tools"],
  Fashion: ["Bags", "Shoes", "Clothing", "Jewelry"],
  Outdoors: ["Water bottles", "Travel bags", "Camping", "Outdoor accessories"],
  Books: ["Journals", "Reading lights", "Books & stationery"],
  Beauty: ["Skin care", "Hair care", "Personal care"],
};

type View = { department: string } | { list: string } | null;

export function AllMenuDrawer({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lists } = useStore();
  const [signedIn, setSignedIn] = useState(true);
  const [view, setView] = useState<View>(null);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const lastPathname = useRef(pathname);
  const departmentNames = categories;
  const departments = showAllDepartments ? departmentNames : departmentNames.slice(0, 4);

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);
  const closeAfterNavigation = () => onClose();
  const searchFor = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };
  const currentDepartment = view && "department" in view ? view.department : null;
  const currentList = view && "list" in view ? view.list : null;
  const listIds = currentList ? lists[currentList] ?? [] : [];

  return (
    <div className="all-menu-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="all-menu-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-label="All departments and account menu">
        <div className="all-menu-header">
          <CircleUserRound size={27} aria-hidden="true" />
          <strong>Hello, {signedIn ? "Muhammad" : "sign in"}</strong>
          <button className="all-menu-close" ref={closeRef} onClick={onClose} aria-label="Close menu"><X size={23} /></button>
        </div>
        <div className="all-menu-content">
          {currentDepartment ? <>
            <button className="all-menu-back" onClick={() => setView(null)}><ChevronLeft size={18} /> MAIN MENU</button>
            <h2>{currentDepartment}</h2>
            <div className="all-menu-section-list">
              {departmentSubcategories[currentDepartment].map((subcategory) => (
                <button key={subcategory} onClick={() => searchFor(subcategory)}>{subcategory}<ChevronRight size={18} /></button>
              ))}
              <Link href={`/search?q=${encodeURIComponent(currentDepartment)}`} onClick={closeAfterNavigation}>See all {currentDepartment}<ChevronRight size={18} /></Link>
            </div>
          </> : currentList ? <>
            <button className="all-menu-back" onClick={() => setView(null)}><ChevronLeft size={18} /> MAIN MENU</button>
            <h2>{currentList}</h2>
            <div className="all-menu-section-list">
              {listIds.length ? listIds.map((id) => {
                const product = products.find((item) => item.id === id);
                return product ? <Link key={id} href={`/product/${id}`} onClick={closeAfterNavigation}>{product.title}<ChevronRight size={18} /></Link> : null;
              }) : <p className="all-menu-empty">This list is empty.</p>}
            </div>
          </> : <>
            <section className="all-menu-section">
              <h2>Shop by Department</h2>
              <div className="all-menu-section-list">
                {departments.map((department) => <button key={department} onClick={() => setView({ department })}>{department}<ChevronRight size={18} /></button>)}
                {departmentNames.length > 4 && <button className="all-menu-see-all" onClick={() => setShowAllDepartments(!showAllDepartments)}>{showAllDepartments ? "See less" : "See all"}<ChevronRight size={18} className={showAllDepartments ? "rotated" : ""} /></button>}
              </div>
            </section>
            <section className="all-menu-section">
              <h2>Programs &amp; Features</h2>
              <div className="all-menu-section-list"><button onClick={() => searchFor("gift cards")}>Gift Cards<ChevronRight size={18} /></button></div>
            </section>
            <section className="all-menu-section">
              <h2>Help &amp; Settings</h2>
              <div className="all-menu-section-list">
                <Link href="/cart" onClick={closeAfterNavigation}>Your Account<ChevronRight size={18} /></Link>
                <Link href="/order-confirmation" onClick={closeAfterNavigation}>Your Orders<ChevronRight size={18} /></Link>
                <button onClick={() => setView({ list: Object.keys(lists)[0] ?? "Shopping List" })}>Your Lists<ChevronRight size={18} /></button>
                <Link href="/#top" onClick={closeAfterNavigation}>Customer Service<ChevronRight size={18} /></Link>
                <button onClick={() => setSignedIn(!signedIn)}>{signedIn ? "Sign out" : "Sign in"}<ChevronRight size={18} /></button>
              </div>
            </section>
          </>}
        </div>
      </aside>
    </div>
  );
}
