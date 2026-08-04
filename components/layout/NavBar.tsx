"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import UserMenu from "@/components/layout/UserMenu";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    // Run once on mount: a reload part-way down the page starts scrolled, and
    // the listener alone wouldn't fire until the next scroll.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`border-border fixed inset-x-0 top-0 z-50 h-24 border-b transition-all duration-500 ${
        scrolled ? "bg-background/60 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex h-full max-w-360 items-center justify-center px-5 md:px-16">
        <Link
          href="/"
          aria-label="Jack The Jelli — Home"
          className="block h-10 transition-opacity hover:opacity-80 md:h-12"
        >
          {/* The link already carries the brand name. */}
          <Logo priority alt="" />
        </Link>

        <div className="absolute right-5 flex items-center gap-4 md:right-16 md:gap-6">
          <UserMenu />

          {/* Inert until the cart feature lands. Disabled rather than silently
              unresponsive, and without the filled badge — that dot read as
              "you have items", which was never true. */}
          <button
            type="button"
            disabled
            // Negative margin holds the icon in place while the padding gives
            // it a 40px hit area; bare, it was a 20px target.
            className="text-foreground focus-visible:ring-ring/50 -m-2.5 p-2.5 outline-hidden transition-opacity duration-300 focus-visible:ring-3 disabled:opacity-40"
            aria-label="Cart — coming soon"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
