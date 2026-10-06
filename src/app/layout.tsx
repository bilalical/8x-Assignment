import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AddToCartToast } from "@/components/add-to-cart-toast";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon",
  description: "Explore useful things for home, work, and the everyday.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div id="top" />
          <SiteHeader />
          <main>{children}</main>
          <AddToCartToast />
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
