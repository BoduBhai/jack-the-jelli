import { Globe } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

const supportLinks = ["Shipping & Returns", "Privacy & Terms"];

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(138,121,104,0.2)]">
      <div className="mx-auto max-w-360 px-5 pb-4 md:px-16 md:pb-8">
        {/* Centered: logo */}
        <div className="flex justify-center">
          <Link href="#" className="w-30 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        </div>

        {/* Centered: tagline */}
        <p className="text-on-surface-variant mt-4 text-center text-[14px] leading-relaxed tracking-wider">
          Artisanal leather goods, crafted for the discerning few.
        </p>

        {/* Centered: support links */}
        <nav className="mt-6 flex justify-center gap-8">
          {supportLinks.map((link) => (
            <Link
              key={link}
              href="#"
              className="text-on-surface-variant hover:text-foreground text-[14px] leading-relaxed transition-colors"
            >
              {link}
            </Link>
          ))}
        </nav>

        {/* Bottom: copyright + language */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <span className="text-on-surface-variant text-[10px] font-semibold tracking-[0.25em] uppercase">
            © 2026 JACK THE JELLI
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant text-[10px] font-medium">
              EN
            </span>
            <Link
              href="#"
              className="text-on-surface-variant hover:text-foreground transition-colors"
              aria-label="Language"
            >
              <Globe className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
