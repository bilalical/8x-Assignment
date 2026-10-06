import Link from "next/link";
import { AmazonLogo } from "@/components/amazon-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a href="#top" className="back-to-top">Back to top</a>
      <div className="footer-main">
        <div>
          <strong>Get to know us</strong>
          <Link href="/">Our story</Link>
          <Link href="/">Thoughtful shopping</Link>
          <Link href="/">Contact</Link>
        </div>
        <div>
          <strong>Make yourself at home</strong>
          <Link href="/orders">Your Orders</Link>
          <Link href="/cart">Your cart</Link>
          <Link href="/search">Explore the shop</Link>
          <Link href="/">Help center</Link>
        </div>
        <div className="footer-note"><AmazonLogo className="footer-logo" /><p>Good finds for the everyday.</p></div>
      </div>
      <div className="footer-bottom">© 2026 Everyday Market · A thoughtful shopping demo</div>
    </footer>
  );
}
