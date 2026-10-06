"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { brands, categories, formatPrice, materials, searchProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export function SearchResults({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minimumRating, setMinimumRating] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let results = searchProducts(initialQuery);
    if (category && category !== "All") results = results.filter((product) => product.category === category);
    if (primeOnly) results = results.filter((product) => product.prime);
    if (selectedMaterials.length) results = results.filter((product) => selectedMaterials.includes(product.material));
    if (selectedBrands.length) results = results.filter((product) => selectedBrands.includes(product.brand));
    if (minimumRating) results = results.filter((product) => product.rating >= minimumRating);
    if (maximumPrice) results = results.filter((product) => product.price <= Number(maximumPrice));
    return [...results].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [initialQuery, category, primeOnly, selectedMaterials, selectedBrands, minimumRating, maximumPrice, sort]);

  const activeFilters = [
    ...(category && category !== "All" ? [{ label: category, clear: () => setCategory("") }] : []),
    ...(primeOnly ? [{ label: "Prime delivery", clear: () => setPrimeOnly(false) }] : []),
    ...selectedMaterials.map((item) => ({ label: item, clear: () => setSelectedMaterials((values) => values.filter((value) => value !== item)) })),
    ...selectedBrands.map((item) => ({ label: item, clear: () => setSelectedBrands((values) => values.filter((value) => value !== item)) })),
    ...(minimumRating ? [{ label: `${minimumRating}+ stars`, clear: () => setMinimumRating(0) }] : []),
    ...(maximumPrice ? [{ label: `Under ${formatPrice(Number(maximumPrice))}`, clear: () => setMaximumPrice("") }] : []),
  ];
  const clearAll = () => {
    setCategory(""); setPrimeOnly(false); setSelectedMaterials([]); setSelectedBrands([]); setMinimumRating(0); setMaximumPrice("");
  };
  const toggleValue = (value: string, current: string[], update: (values: string[]) => void) =>
    update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  return (
    <div className="container page-shell">
      <div className="breadcrumb"><Link href="/">Home</Link>　›　{initialQuery ? <>Search results for “{initialQuery}”</> : "All products"}</div>
      <h1 className="page-title">{initialQuery ? `Results for “${initialQuery}”` : "Explore all the good things"}</h1>
      <div className="results-toolbar">
        <p>{filtered.length} {filtered.length === 1 ? "thoughtful find" : "thoughtful finds"}{initialQuery ? ` for “${initialQuery}”` : ""}</p>
        <label>Sort by{" "}
          <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="filter-toggle-row">
        <button className="button button-secondary" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={15} /> {filtersOpen ? "Hide filters" : "Filters"} <ChevronDown size={15} />
        </button>
        {activeFilters.map((filter) => <button key={filter.label} className="active-filter-chip" onClick={filter.clear}>{filter.label}<X size={12} /></button>)}
        {activeFilters.length > 0 && <button className="clear-filters" onClick={clearAll}>Clear all</button>}
      </div>

      {filtersOpen && <section className="filters-panel" aria-label="Product filters">
        <div className="filters-grid">
          <details className="filter-group">
            <summary>Category<ChevronDown size={15} /></summary>
            <div className="filter-options">
              <label><input type="radio" name="category" checked={!category} onChange={() => setCategory("")} /> All categories</label>
              {categories.map((item) => <label key={item}><input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} /> {item}</label>)}
            </div>
          </details>
          <details className="filter-group">
            <summary>Prime delivery<ChevronDown size={15} /></summary>
            <div className="filter-options"><label><input type="checkbox" checked={primeOnly} onChange={(event) => setPrimeOnly(event.target.checked)} /> Eligible for Prime delivery <span className="prime-badge"><i>prime</i></span></label></div>
          </details>
          <details className="filter-group">
            <summary>Material<ChevronDown size={15} /></summary>
            <div className="filter-options">{materials.map((item) => <label key={item}><input type="checkbox" checked={selectedMaterials.includes(item)} onChange={() => toggleValue(item, selectedMaterials, setSelectedMaterials)} /> {item}</label>)}</div>
          </details>
          <details className="filter-group">
            <summary>Brand<ChevronDown size={15} /></summary>
            <div className="filter-options">{brands.map((item) => <label key={item}><input type="checkbox" checked={selectedBrands.includes(item)} onChange={() => toggleValue(item, selectedBrands, setSelectedBrands)} /> {item}</label>)}</div>
          </details>
          <details className="filter-group">
            <summary>Customer rating<ChevronDown size={15} /></summary>
            <div className="filter-options">{[4, 3, 2].map((rating) => <label key={rating}><input type="radio" name="rating" checked={minimumRating === rating} onChange={() => setMinimumRating(rating)} /><span className="rating-stars">{"★".repeat(rating)}{"☆".repeat(5-rating)}</span> &amp; up</label>)}
              <label><input type="radio" name="rating" checked={minimumRating === 0} onChange={() => setMinimumRating(0)} /> Any rating</label>
            </div>
          </details>
          <details className="filter-group">
            <summary>Price<ChevronDown size={15} /></summary>
            <div className="filter-options"><label htmlFor="max-price">Maximum price</label><div className="price-range"><span>$</span><input id="max-price" inputMode="decimal" type="number" min="0" placeholder="Any" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} /></div></div>
          </details>
        </div>
      </section>}

      {filtered.length ? (
        <div className="results-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="empty-state"><h2>No matches this time</h2><p>Try a different search or clear a filter to see more.</p><button className="button button-secondary" onClick={clearAll}>Clear filters</button></div>
      )}
    </div>
  );
}
