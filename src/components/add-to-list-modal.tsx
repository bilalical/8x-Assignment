"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, imageUrl } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function AddToListModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { lists, saveToList } = useStore();
  const [listName, setListName] = useState(Object.keys(lists)[0] ?? "Shopping List");
  const [saved, setSaved] = useState(false);

  const add = () => {
    const name = listName.trim();
    if (!name) return;
    saveToList(name, product.id);
    setListName(name);
    setSaved(true);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="list-modal" role="dialog" aria-modal="true" aria-labelledby="list-modal-title">
        <div className="modal-heading">
          <h2 id="list-modal-title">Add to a List</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {saved ? (
          <div className="list-success">
            <p className="success-message"><Check size={19} /> Added to {listName}</p>
            <div className="saved-product">
              <img src={imageUrl(product.image, 240)} alt="" />
              <div><strong>{product.title}</strong><span>{formatPrice(product.price)}</span></div>
            </div>
            <button className="button button-secondary button-wide" onClick={onClose}>Continue shopping</button>
          </div>
        ) : (
          <form className="list-modal-body" onSubmit={(event) => { event.preventDefault(); add(); }}>
            <label htmlFor="list-name">List name (required)</label>
            <input id="list-name" list="saved-list-names" value={listName} onChange={(event) => setListName(event.target.value)} required />
            <datalist id="saved-list-names">{Object.keys(lists).map((name) => <option key={name} value={name} />)}</datalist>
            <p className="muted">You can easily access any list you create from the account and lists menu.</p>
            <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">Create</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
