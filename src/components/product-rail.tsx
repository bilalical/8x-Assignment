"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductRail({ title, products }: { title: string; products: Product[] }) {
  const rail = useRef<HTMLDivElement>(null);
  if (!products.length) return null;
  return (
    <section className="product-rail-section">
      <div className="section-heading"><h2>{title}</h2><div className="rail-controls">
        <button className="icon-button" aria-label={`Scroll ${title} left`} onClick={() => rail.current?.scrollBy({ left: -720, behavior: "smooth" })}><ChevronLeft size={19} /></button>
        <button className="icon-button" aria-label={`Scroll ${title} right`} onClick={() => rail.current?.scrollBy({ left: 720, behavior: "smooth" })}><ChevronRight size={19} /></button>
      </div></div>
      <div className="product-rail" ref={rail}>{products.map((product) => <ProductCard compact key={product.id} product={product} />)}</div>
    </section>
  );
}
