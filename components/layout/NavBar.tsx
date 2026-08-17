"use client";

import { useState, useEffect } from "react";
import AppLink from "@/components/layout/AppLink";
import Logo from "@/components/layout/Logo";
import UserMenu from "@/components/layout/UserMenu";
import CartButton from "@/features/cart/components/CartButton";
import CartSessionSync from "@/features/cart/components/CartSessionSync";
import CartSheet from "@/features/cart/components/CartSheet";

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
      // Naming the two transitioned properties rather than transition-all is
      // load-bearing: all would animate scrollbar-lock-safe's margin over 500ms
      // while the scrollbar vanishes instantly, trading the jump for a drift.
      className={`border-border scrollbar-lock-safe fixed inset-x-0 top-0 z-50 h-24 border-b transition-[background-color,backdrop-filter] duration-500 ${
        scrolled ? "bg-background/60 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex h-full max-w-360 items-center justify-center px-5 md:px-16">
        <AppLink
          href="/"
          aria-label="Jack The Jelli — Home"
          className="block h-10 transition-opacity hover:opacity-80 md:h-12"
        >
          {/* The link already carries the brand name. */}
          <Logo priority alt="" />
        </AppLink>

        <div className="absolute right-5 flex items-center gap-4 md:right-16 md:gap-6">
          <UserMenu />
          <CartButton />
        </div>
      </div>

      {/* Mounted here rather than per page so the sheet's open state and its
          revalidation survive client navigations. */}
      <CartSheet />

      {/* Renders nothing. Here for the same reason: the cart has to be checked
          against the live session on every route, not just the ones that
          happen to show it. */}
      <CartSessionSync />
    </nav>
  );
}
