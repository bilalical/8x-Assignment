import Link from "next/link";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { ProductRail } from "@/components/product-rail";
import { categories, products } from "@/lib/catalog";

const departmentImages: Record<string, string> = {
  Electronics: "photo-1498049794561-7780e7231661",
  Home: "photo-1616486338812-3dadae4b4ace",
  Kitchen: "photo-1556911220-e15b29be8c8f",
  Fashion: "photo-1483985988355-763728e1935b",
  Outdoors: "photo-1470770841072-f978cf4d019e",
  Books: "photo-1512820790803-83ca734da794",
  Beauty: "photo-1608248543803-ba4f8c70ae0b",
};

export default function HomePage() {
  const picks = ["linen-throw", "trail-bottle", "ceramic-mug", "orbit-headphones", "indoor-planter", "scented-candle", "chef-knife", "weekender-bag"]
    .map((id) => products.find((product) => product.id === id)!)
    .filter(Boolean);
  const newFinds = ["portable-ssd", "matcha-set", "packing-cubes", "silver-hoops", "face-serum", "desk-organizer", "pouring-kettle"]
    .map((id) => products.find((product) => product.id === id)!)
    .filter(Boolean);

  return (
    <div className="container page-shell">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> A little easier, every day</span>
          <h1>Good things for the way you live.</h1>
          <p>Useful, lovely finds for the everyday. Start with a small idea and see where it takes you.</p>
          <div className="hero-actions">
            <Link href="/search" className="button button-primary">Explore the shop <ArrowRight size={15} /></Link>
            <Link href="/gift-cards" className="text-link">Visit the Gift Card Shop</Link>
            <Link href="/search?q=Home" className="text-link">Find your next home favorite</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85" alt="Warm, relaxed living room with natural textures" fetchPriority="high" />
        </div>
      </section>

      <section className="department-section">
        <div className="section-heading">
          <h2>A few places to start</h2>
          <Link href="/search" className="text-link">Browse everything</Link>
        </div>
        <div className="department-grid">
          {categories.map((category, index) => (
            <Link
              key={category}
              className="department-card"
              style={{ "--department-color": ["#d8dfd5","#e9ded2","#e4e0d6","#e2d8d0","#d8e2df","#e8e3dc","#e6d8d2"][index] } as React.CSSProperties}
              href={`/search?q=${encodeURIComponent(category)}`}
            >
              <img src={`https://images.unsplash.com/${departmentImages[category]}?auto=format&fit=crop&w=450&q=78`} alt="" loading="lazy" />
              <span>{category}</span>
            </Link>
          ))}
        </div>
        <span className="category-note"><Leaf size={14} /> Thoughtful finds, made for real life.</span>
      </section>

      <ProductRail title="Small upgrades, big everyday joy" products={picks} />
      <ProductRail title="A few good things we found" products={newFinds} />

      <aside className="home-note">
        <Leaf size={20} />
        <div><strong>Shop at your own pace.</strong><p>Browse the collection, save a favorite for later, or add it to your cart. No rush, no noise.</p></div>
      </aside>
    </div>
  );
}
