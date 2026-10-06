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
          <Link href="/gift-cards">Gift Cards</Link>
          <Link href="/">Help center</Link>
        </div>
        <div className="footer-note"><AmazonLogo className="footer-logo" /><p>Find what you need on Amazon.</p></div>
      </div>
      <div className="footer-bottom">© 2026 Amazon · A thoughtful shopping demo</div>
    </footer>
  );
}
