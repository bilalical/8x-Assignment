import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { ProductRail } from "@/components/product-rail";
import { products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 8);
  const viewed = products.filter((item) => item.id !== product.id && item.category !== product.category).slice(8, 16);

  return <div className="container page-shell">
    <div className="breadcrumb"><Link href="/">Home</Link>　›　<Link href={`/search?q=${encodeURIComponent(product.category)}`}>{product.category}</Link>　›　{product.title}</div>
    <ProductDetail product={product} />
    <div className="product-recommendations">
      <ProductRail title="Related items" products={related} />
      <ProductRail title="Customers also viewed" products={viewed} />
    </div>
  </div>;
}
