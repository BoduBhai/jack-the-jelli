"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
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
          <Logo priority />
        </Link>

        <button
          className="text-foreground absolute right-5 transition-opacity duration-300 hover:opacity-70 md:right-16"
          aria-label="Cart"
        >
          <ShoppingBag className="h-5 w-5 font-light" />
          <span className="bg-foreground absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
        </button>
      </div>
    </nav>
  );
}
