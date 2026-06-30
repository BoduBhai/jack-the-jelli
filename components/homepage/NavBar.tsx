"use client";

import { useState, useEffect } from "react";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Collection", href: "#collection" },
  { label: "Craftsmanship", href: "#craftsmanship" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`border-secondary/50 fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "bg-background/60 py-6 backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-360 items-center justify-between px-5 md:px-16">
        {/* Mobile menu toggle */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Left nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-foreground text-xs font-semibold tracking-widest text-(--on-surface-variant) uppercase transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link
            href="#"
            className="block w-35 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo.svg"
              alt="JACK THE JELLI"
              className="h-auto w-full object-contain"
              loading="eager"
              width={140}
              height={140}
            />
          </Link>
        </div>

        {/* Right icons */}
        <div className="text-foreground flex items-center gap-4 md:gap-6">
          <button
            className="transition-opacity duration-300 hover:opacity-70"
            aria-label="Account"
          >
            <User className="h-5 w-5 font-light" />
          </button>
          <button
            className="relative transition-opacity duration-300 hover:opacity-70"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5 font-light" />
            <span className="bg-foreground absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="bg-background absolute inset-x-0 top-full flex flex-col gap-4 border-t border-[rgba(138,121,104,0.2)] px-5 py-6 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-foreground text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase transition-colors duration-300"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
