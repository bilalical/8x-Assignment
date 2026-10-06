import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Everyday Market | Good finds for the everyday",
  description: "Explore useful things for home, work, and the everyday.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div id="top" />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
