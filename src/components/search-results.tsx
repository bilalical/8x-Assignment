"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { brands, categories, formatPrice, materials, searchProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

type FilterGroup = "category" | "rating" | "brand" | "price" | "prime" | "delivery" | "material" | "color" | "size" | "condition" | "deal" | "availability";
type FilterOption = { label: string; value: string; count: number };

const colors = ["black", "white", "gray", "grey", "blue", "green", "red", "pink", "purple", "yellow", "orange", "brown", "beige", "neutral", "silver", "gold"];
const sizePattern = /\b(?:\d+(?:\.\d+)?\s?(?:oz|inches|inch|in|mm|cm|ml|l|gb|tb|pieces?|count)|set of (?:two|three|four)|\d+-piece set)\b/gi;

function productColors(product: Product) {
  const text = `${product.title} ${product.description}`.toLowerCase();
  return colors.filter((color) => new RegExp(`\\b${color}\\b`, "i").test(text)).map((color) => color === "grey" ? "Gray" : color[0].toUpperCase() + color.slice(1));
}

function productSizes(product: Product) {
  return [...new Set(product.title.match(sizePattern) ?? [])].map((size) => size.replace(/\s+/g, " ").trim());
}

function productCondition(product: Product) {
  return product.condition ?? "New";
}

function productAvailability(product: Product) {
  return product.inStock === false ? "Out of stock" : "In stock";
}

function productDelivery(product: Product) {
  return product.prime ? "Fast delivery" : "Standard delivery";
}

export function SearchResults({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory === "All" ? "" : initialCategory);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [minimumRating, setMinimumRating] = useState(0);
  const [minimumPrice, setMinimumPrice] = useState<number | null>(null);
  const [maximumPrice, setMaximumPrice] = useState<number | null>(null);
  const [sort, setSort] = useState("featured");
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const searchResults = useMemo(() => searchProducts(initialQuery), [initialQuery]);
  const matches = (product: Product, except?: FilterGroup) => {
    if (except !== "category" && category && product.category !== category) return false;
    if (except !== "prime" && primeOnly && !product.prime) return false;
    if (except !== "material" && selectedMaterials.length && !selectedMaterials.includes(product.material)) return false;
    if (except !== "brand" && selectedBrands.length && !selectedBrands.includes(product.brand)) return false;
    if (except !== "rating" && minimumRating && product.rating < minimumRating) return false;
    if (except !== "price" && ((minimumPrice !== null && product.price < minimumPrice) || (maximumPrice !== null && product.price > maximumPrice))) return false;
    if (except !== "color" && selectedColors.length && !productColors(product).some((value) => selectedColors.includes(value))) return false;
    if (except !== "size" && selectedSizes.length && !productSizes(product).some((value) => selectedSizes.includes(value))) return false;
    if (except !== "delivery" && selectedDelivery.length && !selectedDelivery.includes(productDelivery(product))) return false;
    if (except !== "condition" && selectedConditions.length && !selectedConditions.includes(productCondition(product))) return false;
    if (except !== "deal" && selectedDeals.length && !(product.discountPercent && selectedDeals.includes(`${product.discountPercent}% off`))) return false;
    if (except !== "availability" && selectedAvailability.length && !selectedAvailability.includes(productAvailability(product))) return false;
    return true;
  };
  const filtered = [...searchResults.filter((product) => matches(product))].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const clearAll = () => {
    setCategory(""); setPrimeOnly(false); setSelectedMaterials([]); setSelectedBrands([]); setSelectedColors([]);
    setSelectedSizes([]); setSelectedDelivery([]); setSelectedConditions([]); setSelectedDeals([]);
    setSelectedAvailability([]); setMinimumRating(0); setMinimumPrice(null); setMaximumPrice(null);
  };
  const toggleValue = (value: string, current: string[], update: (values: string[]) => void) =>
    update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const candidatesFor = (group: FilterGroup) => searchResults.filter((product) => matches(product, group));
  const optionsFor = (values: string[], group: FilterGroup, predicate: (product: Product, value: string) => boolean): FilterOption[] =>
    [...new Set(values)].map((value) => ({
      label: value,
      value,
      count: candidatesFor(group).filter((product) => predicate(product, value)).length,
    })).filter((option) => option.count > 0);

  const departmentOptions = optionsFor(categories, "category", (product, value) => product.category === value);
  const brandOptions = optionsFor(brands, "brand", (product, value) => product.brand === value);
  const materialOptions = optionsFor(materials, "material", (product, value) => product.material === value);
  const colorOptions = optionsFor(candidatesFor("color").flatMap(productColors), "color", (product, value) => productColors(product).includes(value));
  const sizeOptions = optionsFor(candidatesFor("size").flatMap(productSizes), "size", (product, value) => productSizes(product).includes(value));
  const deliveryOptions = optionsFor(["Fast delivery", "Standard delivery"], "delivery", (product, value) => productDelivery(product) === value);
  const conditionOptions = optionsFor([...new Set(searchResults.map(productCondition))], "condition", (product, value) => productCondition(product) === value);
  const dealOptions = optionsFor(
    [...new Set(searchResults.flatMap((product) => product.discountPercent ? [`${product.discountPercent}% off`] : []))],
    "deal",
    (product, value) => Boolean(product.discountPercent && `${product.discountPercent}% off` === value),
  );
  const availabilityOptions = optionsFor(["In stock", "Out of stock"], "availability", (product, value) => productAvailability(product) === value);
  const ratingOptions = [4, 3, 2, 1].map((rating) => ({
    label: `${rating} stars & up`,
    value: String(rating),
    count: candidatesFor("rating").filter((product) => product.rating >= rating).length,
  })).filter((option) => option.count > 0);
  const priceProducts = candidatesFor("price");
  const minBound = priceProducts.length ? Math.min(...priceProducts.map((product) => product.price)) : 0;
  const maxBound = priceProducts.length ? Math.max(...priceProducts.map((product) => product.price)) : 0;
  const priceMin = Math.max(minBound, Math.min(maxBound, minimumPrice ?? minBound));
  const priceMax = Math.max(priceMin, Math.min(maxBound, maximumPrice ?? maxBound));
  const priceSpan = maxBound - minBound || 1;
  const priceBuckets = Array.from({ length: 20 }, (_, index) => {
    const low = minBound + priceSpan * index / 20;
    const high = index === 19 ? maxBound : minBound + priceSpan * (index + 1) / 20;
    const count = priceProducts.filter((product) => product.price >= low && (index === 19 ? product.price <= high : product.price < high)).length;
    const selected = high >= priceMin && low <= priceMax;
    return { low, high, count, selected };
  });
  const hasPriceFilter = priceMin > minBound || priceMax < maxBound;
  const activeFilters: { label: string; clear: () => void }[] = [
    ...(category ? [{ label: category, clear: () => setCategory("") }] : []),
    ...(primeOnly ? [{ label: "Prime delivery", clear: () => setPrimeOnly(false) }] : []),
    ...selectedMaterials.map((item) => ({ label: item, clear: () => setSelectedMaterials((values) => values.filter((value) => value !== item)) })),
    ...selectedBrands.map((item) => ({ label: item, clear: () => setSelectedBrands((values) => values.filter((value) => value !== item)) })),
    ...selectedColors.map((item) => ({ label: item, clear: () => setSelectedColors((values) => values.filter((value) => value !== item)) })),
    ...selectedSizes.map((item) => ({ label: item, clear: () => setSelectedSizes((values) => values.filter((value) => value !== item)) })),
    ...selectedDelivery.map((item) => ({ label: item, clear: () => setSelectedDelivery((values) => values.filter((value) => value !== item)) })),
    ...selectedConditions.map((item) => ({ label: item, clear: () => setSelectedConditions((values) => values.filter((value) => value !== item)) })),
    ...selectedDeals.map((item) => ({ label: item, clear: () => setSelectedDeals((values) => values.filter((value) => value !== item)) })),
    ...selectedAvailability.map((item) => ({ label: item, clear: () => setSelectedAvailability((values) => values.filter((value) => value !== item)) })),
    ...(minimumRating ? [{ label: `${minimumRating}+ stars`, clear: () => setMinimumRating(0) }] : []),
    ...(hasPriceFilter ? [{ label: `${formatPrice(priceMin)} – ${formatPrice(priceMax)}`, clear: () => { setMinimumPrice(null); setMaximumPrice(null); } }] : []),
  ];

  const renderCheckboxOptions = (group: FilterGroup, options: FilterOption[], selected: string[], update: (values: string[]) => void) => {
    if (!options.length) return null;
    const expanded = showMore[group] ?? false;
    const visible = expanded ? options : options.slice(0, 6);
    return <div className="filter-options">
      {visible.map((option) => <label key={option.value}>
        <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggleValue(option.value, selected, update)} />
        <span className="filter-option-label">{option.label}</span><span className="filter-count">({option.count})</span>
      </label>)}
      {options.length > 6 && <button className="see-more-button" onClick={() => setShowMore((current) => ({ ...current, [group]: !expanded }))}>{expanded ? "See less" : "See more"}</button>}
    </div>;
  };
  const renderGroup = (title: string, group: FilterGroup, options: FilterOption[], children: React.ReactNode, initiallyOpen = false) => options.length
    ? <details className="filter-group" key={group} open={openGroups[group] ?? initiallyOpen} onToggle={(event) => {
      const isOpen = event.currentTarget.open;
      setOpenGroups((current) => ({ ...current, [group]: isOpen }));
    }}><summary>{title}<ChevronDown size={15} /></summary>{children}</details>
    : null;
  const setPriceFromSlider = (edge: "min" | "max", value: number) => {
    if (edge === "min") {
      setMinimumPrice(value <= minBound ? null : value);
      if (value > priceMax) setMaximumPrice(value >= maxBound ? null : value);
    } else {
      setMaximumPrice(value >= maxBound ? null : value);
      if (value < priceMin) setMinimumPrice(value <= minBound ? null : value);
    }
  };
  const updatePriceInput = (edge: "min" | "max", raw: string) => {
    const value = raw === "" ? null : Number(raw);
    if (value !== null && !Number.isFinite(value)) return;
    if (edge === "min") {
      const next = value === null ? null : Math.max(minBound, Math.min(maxBound, value));
      setMinimumPrice(next === minBound ? null : next);
      if (next !== null && next > priceMax) setMaximumPrice(next >= maxBound ? null : next);
    } else {
      const next = value === null ? null : Math.max(minBound, Math.min(maxBound, value));
      setMaximumPrice(next === maxBound ? null : next);
      if (next !== null && next < priceMin) setMinimumPrice(next <= minBound ? null : next);
    }
  };

  const filterGroups = <div className="filters-grid">
    {renderGroup("Department", "category", departmentOptions, <div className="filter-options">
      <label><input type="radio" name="category" checked={!category} onChange={() => setCategory("")} /><span className="filter-option-label">All departments</span><span className="filter-count">({candidatesFor("category").length})</span></label>
      {departmentOptions.map((option) => <label key={option.value}><input type="radio" name="category" checked={category === option.value} onChange={() => setCategory(option.value)} /><span className="filter-option-label">{option.label}</span><span className="filter-count">({option.count})</span></label>)}
    </div>, true)}
    {renderGroup("Customer reviews", "rating", ratingOptions, <div className="filter-options">
      {ratingOptions.map((option) => <label key={option.value}><input type="radio" name="rating" checked={minimumRating === Number(option.value)} onChange={() => setMinimumRating(Number(option.value))} /><span className="rating-stars">{"★".repeat(Number(option.value))}{"☆".repeat(5 - Number(option.value))}</span><span className="filter-option-label">{option.label}</span><span className="filter-count">({option.count})</span></label>)}
      <label><input type="radio" name="rating" checked={minimumRating === 0} onChange={() => setMinimumRating(0)} /><span className="filter-option-label">Any rating</span><span className="filter-count">({candidatesFor("rating").length})</span></label>
    </div>, true)}
    {renderGroup("Brand", "brand", brandOptions, renderCheckboxOptions("brand", brandOptions, selectedBrands, setSelectedBrands))}
    {priceProducts.length > 0 && <details className="filter-group" key="price" open={openGroups.price ?? true} onToggle={(event) => {
      const isOpen = event.currentTarget.open;
      setOpenGroups((current) => ({ ...current, price: isOpen }));
    }}>
      <summary>Price<ChevronDown size={15} /></summary>
      <div className="filter-options price-filter">
        <div className="price-histogram" aria-label={`Product price histogram from ${formatPrice(minBound)} to ${formatPrice(maxBound)}`}>
          {priceBuckets.map((bucket, index) => <span key={index} className={`price-histogram-bar${bucket.selected ? " selected" : " outside"}`} title={`${formatPrice(bucket.low)}–${formatPrice(bucket.high)}: ${bucket.count} products`}><i style={{ height: `${Math.max(4, bucket.count / Math.max(1, ...priceBuckets.map((item) => item.count)) * 100)}%` }} /></span>)}
        </div>
        <div className="price-slider" aria-label="Select price range">
          <input aria-label="Minimum price slider" type="range" min={minBound} max={maxBound || minBound + 1} step="0.01" value={priceMin} onChange={(event) => setPriceFromSlider("min", Number(event.target.value))} />
          <input aria-label="Maximum price slider" type="range" min={minBound} max={maxBound || minBound + 1} step="0.01" value={priceMax} onChange={(event) => setPriceFromSlider("max", Number(event.target.value))} />
        </div>
        <div className="price-endpoints"><span>{formatPrice(minBound)}</span><span>{formatPrice(maxBound)}</span></div>
        <div className="price-input-row">
          <label>Min <span className="price-range"><span>$</span><input type="number" min={minBound} max={maxBound} step="0.01" value={minimumPrice ?? ""} placeholder={minBound.toFixed(2)} onChange={(event) => updatePriceInput("min", event.target.value)} /></span></label>
          <span aria-hidden="true">–</span>
          <label>Max <span className="price-range"><span>$</span><input type="number" min={minBound} max={maxBound} step="0.01" value={maximumPrice ?? ""} placeholder={maxBound.toFixed(2)} onChange={(event) => updatePriceInput("max", event.target.value)} /></span></label>
        </div>
      </div>
    </details>}
    {renderGroup("Prime delivery", "prime", [{ label: "Prime eligible", value: "prime", count: candidatesFor("prime").filter((product) => product.prime).length }].filter((option) => option.count), <div className="filter-options"><label><input type="checkbox" checked={primeOnly} onChange={(event) => setPrimeOnly(event.target.checked)} /><span className="filter-option-label">Eligible for Prime delivery <span className="prime-badge"><i>prime</i></span></span><span className="filter-count">({candidatesFor("prime").filter((product) => product.prime).length})</span></label></div>)}
    {renderGroup("Delivery day", "delivery", deliveryOptions, renderCheckboxOptions("delivery", deliveryOptions, selectedDelivery, setSelectedDelivery))}
    {renderGroup("Material", "material", materialOptions, renderCheckboxOptions("material", materialOptions, selectedMaterials, setSelectedMaterials))}
    {renderGroup("Color", "color", colorOptions, renderCheckboxOptions("color", colorOptions, selectedColors, setSelectedColors))}
    {renderGroup("Size", "size", sizeOptions, renderCheckboxOptions("size", sizeOptions, selectedSizes, setSelectedSizes))}
    {renderGroup("Condition", "condition", conditionOptions, renderCheckboxOptions("condition", conditionOptions, selectedConditions, setSelectedConditions))}
    {renderGroup("Deals", "deal", dealOptions, renderCheckboxOptions("deal", dealOptions, selectedDeals, setSelectedDeals))}
    {renderGroup("Availability", "availability", availabilityOptions, renderCheckboxOptions("availability", availabilityOptions, selectedAvailability, setSelectedAvailability))}
  </div>;

  return (
    <div className="container page-shell">
      <div className="breadcrumb"><Link href="/">Home</Link>　›　{initialQuery ? <>Search results for “{initialQuery}”</> : "All products"}</div>
      <h1 className="page-title">{initialQuery ? `Results for “${initialQuery}”` : "Explore all the good things"}</h1>
      <div className="results-toolbar">
        <p>{filtered.length} {filtered.length === 1 ? "thoughtful find" : "thoughtful finds"}{initialQuery ? ` for “${initialQuery}”` : ""}</p>
        <label>Sort by{" "}
          <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option><option value="rating">Top rated</option>
            <option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="filter-toggle-row">
        <button className="button button-secondary" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={15} /> {filtersOpen ? "Hide filters" : "Filters"} <ChevronDown size={15} />
        </button>
        {activeFilters.map((filter, index) => <button key={`${filter.label}-${index}`} className="active-filter-chip" onClick={filter.clear}>{filter.label}<X size={12} /></button>)}
        {activeFilters.length > 0 && <button className="clear-filters" onClick={clearAll}>Clear all</button>}
      </div>

      <div className="results-layout">
        <div className={`filters-overlay${filtersOpen ? " is-open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false); }}>
        <section className="filters-panel" role={filtersOpen ? "dialog" : undefined} aria-modal={filtersOpen ? true : undefined} aria-label="Product filters" onMouseDown={(event) => event.stopPropagation()}>
          <div className="filters-heading"><strong>Filters</strong><button className="icon-button filters-close" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={19} /></button></div>
          {filterGroups}
          <div className="filters-footer"><button className="clear-filters" onClick={clearAll}>Clear all</button><button className="button button-primary filters-apply" onClick={() => setFiltersOpen(false)}><Check size={15} /> Apply ({filtered.length} results)</button></div>
        </section>
        </div>

        <div className="results-main">{filtered.length ? <div className="results-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : (
          <div className="empty-state"><h2>No matches this time</h2><p>Try a different search or clear a filter to see more.</p><button className="button button-secondary" onClick={clearAll}>Clear filters</button></div>
        )}</div>
      </div>
    </div>
  );
}
