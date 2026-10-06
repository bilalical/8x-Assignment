"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, imageUrl } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { AddToListModal } from "./add-to-list-modal";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore();
  const [showList, setShowList] = useState(false);
  const add = () => {
    addToCart(product);
  };

  return (
    <>
      <article className={`product-card${compact ? " product-card-compact" : ""}`}>
        <Link className="product-card-image" href={`/product/${product.id}`}>
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <img src={imageUrl(product.image, 560)} alt={product.title} loading="lazy" />
        </Link>
        <div className="product-card-content">
          <span className="product-category">{product.category}</span>
          <Link href={`/product/${product.id}`} className="product-card-title">{product.title}</Link>
          <div className="rating-line"><span className="rating-stars">★★★★★</span><span>{product.rating}</span><span className="muted">({product.reviews.toLocaleString()})</span></div>
          <strong className="product-price">{formatPrice(product.price)}</strong>
          {product.prime && <span className="prime-badge"><i>prime</i> fast, free delivery</span>}
          <div className="product-card-actions">
            <button className="button button-primary" onClick={add}>Add to cart</button>
            <button className="icon-button save-button" onClick={() => setShowList(true)} aria-label={`Add ${product.title} to a list`}><BookmarkPlus size={18} /></button>
          </div>
        </div>
      </article>
      {showList && <AddToListModal product={product} onClose={() => setShowList(false)} />}
    </>
  );
}
