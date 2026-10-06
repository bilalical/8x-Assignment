"use client";

import { useState } from "react";
import { BookmarkPlus, Check, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, imageUrl } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { AddToListModal } from "./add-to-list-modal";

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [zoomed, setZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showList, setShowList] = useState(false);
  const [added, setAdded] = useState(false);
  const add = () => {
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <section className="product-layout">
        <div className="product-gallery">
          <div className="gallery-thumbnails" aria-label="Product image options">
            {[0,1,2,3].map((index) => <button key={index} className={`gallery-thumb${index === 0 ? " active" : ""}`} onClick={() => setZoomed(false)} aria-label={`View product image ${index + 1}`}><img src={imageUrl(product.image, 150)} alt="" /></button>)}
          </div>
          <button className={`main-product-image${zoomed ? " zoomed" : ""}`} onClick={() => setZoomed(!zoomed)} aria-label={zoomed ? "Zoom out of product image" : "Zoom product image"}>
            <img src={imageUrl(product.image, 1000)} alt={product.title} />
          </button>
          <p className="gallery-hint">Hover or tap the image to zoom</p>
        </div>
        <div className="product-detail">
          <p className="product-category-line">{product.brand} <span>·</span> {product.category}</p>
          <h1>{product.title}</h1>
          <div className="detail-rating"><span className="rating-stars">★★★★★</span><strong>{product.rating}</strong><span className="muted">{product.reviews.toLocaleString()} ratings</span></div>
          <div className="detail-price"><span>-</span><strong>{formatPrice(product.price)}</strong></div>
          <p className="product-description detail-description">{product.description}</p>
          <div className="feature-list">
            <span>Made for everyday use, with thoughtful details.</span>
            <span>Easy to enjoy at home, at work, or on the go.</span>
            <span>Selected by the Everyday Market team.</span>
          </div>
          {product.prime && <div className="detail-prime"><i className="prime-badge"><i>prime</i></i> Fast, free delivery available on this item.</div>}
          <div className="product-detail-actions">
            <button className="button button-secondary" onClick={() => setShowList(true)}><BookmarkPlus size={16} /> Add to a List</button>
          </div>
        </div>
        <aside className="purchase-card">
          <div className="purchase-card-price">{formatPrice(product.price)}</div>
          <div className="delivery-copy"><strong>FREE delivery</strong> on your first order. Order today, enjoy it soon.</div>
          {product.prime && <div className="detail-prime"><i className="prime-badge"><i>prime</i></i> Free delivery for Prime members.</div>}
          <div className="delivery-copy">Ships from <strong>Everyday Market</strong><br />Sold by <strong>{product.brand}</strong></div>
          <label className="muted" htmlFor="purchase-quantity">Quantity</label>
          <select id="purchase-quantity" className="purchase-quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
            {[1,2,3,4,5,6,7,8,9,10].map((number) => <option key={number} value={number}>{number}</option>)}
          </select>
          <div className="purchase-actions">
            <button className="button button-primary button-wide" onClick={add}>{added ? <><Check size={16} /> Added to cart</> : "Add to Cart"}</button>
          </div>
          <div className="feature-list">
            <span><Truck size={15} /> Free returns within 30 days.</span>
            <span><ShieldCheck size={15} /> Secure transaction.</span>
          </div>
          <p className="purchase-note">This is a mock checkout. No payment is collected.</p>
        </aside>
      </section>
      {showList && <AddToListModal product={product} onClose={() => setShowList(false)} />}
    </>
  );
}
