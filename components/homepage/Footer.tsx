import { Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const supportLinks = ["Shipping & Returns", "Privacy & Terms"];

export default function Footer() {
  return (
    <footer className="bg-background dark:bg-primary w-full border-t border-[rgba(138,121,104,0.2)]">
      <div
        className="mx-auto grid max-w-360 grid-cols-2 gap-8 px-5 py-8 md:px-16"
        style={{ maxHeight: "400px" }}
      >
        {/* Brand column */}
        <div className="flex flex-col justify-end gap-6">
          <Link
            href="#"
            className="block w-37.5 transition-opacity hover:opacity-80"
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
          <p className="max-w-xs text-[16px] leading-[1.6] text-(--on-surface-variant)">
            Artisanal leather goods, crafted for the discerning few.
          </p>
        </div>

        {/* Support column */}
        <div className="mt-6 flex flex-col gap-4">
          <span className="text-foreground mb-2 text-[12px] font-semibold tracking-widest uppercase">
            Support
          </span>
          {supportLinks.map((link) => (
            <Link
              key={link}
              href="#"
              className="hover:text-foreground text-[16px] leading-[1.6] text-(--on-surface-variant) transition-colors duration-300"
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="col-span-2 flex flex-col items-center justify-between gap-4 border-t border-[rgba(138,121,104,0.2)] py-8 md:flex-row">
          <span className="text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase">
            © 2026 JACK THE JELLI. CRAFTED FOR THE DISCERNING.
          </span>
          <Link
            href="#"
            className="hover:text-foreground text-(--on-surface-variant) transition-colors"
            aria-label="Language"
          >
            <Globe className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
