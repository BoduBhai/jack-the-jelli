import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/homepage/Footer";

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
      className={`${garamond.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="text-primary m-0 flex min-h-full flex-col font-(--font-inter) antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
