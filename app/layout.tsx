import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import RouteProgress from "@/components/layout/RouteProgress";
import { Toaster } from "@/components/ui/sonner";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Jack The Jelli | Crafted for the Discerning",
  description: "Artisanal leather goods, crafted for the discerning few.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${garamond.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="text-primary m-0 flex min-h-full flex-col font-(--font-inter) antialiased">
        {/* Storefront chrome (nav + footer) lives in app/(storefront)/layout.tsx
            so /admin opts out by route rather than by a pathname check. */}
        {children}
        {/* Mounted at the root, above every route group, so one bar serves the
            storefront, the auth pages and /admin alike. */}
        <RouteProgress />
        <Toaster />
      </body>
    </html>
  );
}
