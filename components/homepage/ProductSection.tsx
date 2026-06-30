"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import Link from "next/link";

const flameImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHtIARaKt5BvtQN4y3QXm-c-ZFBa8b15Wy5cQoRhRiInTj483QUDl26DBNdnBm6mwXh0J5vjJi8h1RKg0JCP9Z5BIMhMEiwlVGDetafXRgU5Wh46B5-lG0d6IJ0J1P35nu735UGEb61fGDepBSnwGT_moQ3bii2YU8p_Y00Mhw5hlbVdGSDNp2FoWI5PIG-ifj49ZZgv853DBUW3_FlmDEHjZZaQJtOvwjPzwAPtGR-4jhXMMYqh4n0iFIKkxL7urEqsqZQxVdh0OD";

const regularImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCGsD0T_IBGaLXNSbF6aA2nFDdW4mMG9CtVwXXzatVVVjnjvkgf6XSWkA5tkEyJkp7hOZjk7fzJzOVkrv57e_1M_mPRJGFGLww2IaGBMfkg_7otGwbVddyCMvrfUZ-6hz5FZ4Vo3MrqssbPDcpldUGweGbUfiKUzOM4LjjvfkYn8n2-akp5kyzJ5PgS0lWzAueIWvwMPsYP1HI7jSzjxXIIvCYj0ZU3GV0lbMCaOr1HbFiZnDLuvkYP-QY225sPAJVp0q0uWVJjtq-I";

export default function ProductSection() {
  // FIX: Changed rootMargin from "-50px" to "-150px".
  // This triggers the observer earlier, preventing the "late" appearance.
  const { ref: ref1, isVisible: vis1 } = useInView({}, "5px");
  const { ref: ref2, isVisible: vis2 } = useInView({}, "5px");
  const { ref: ref3, isVisible: vis3 } = useInView({}, "5px");
  const { ref: ref4, isVisible: vis4 } = useInView({}, "5px");
  const { ref: ref5, isVisible: vis5 } = useInView({}, "5px");
  const { ref: ref6, isVisible: vis6 } = useInView({}, "5px");

  // Common transition classes for performance
  const baseTransition =
    "transition-[opacity,transform] duration-1000 delay-[100ms]";

  return (
    <>
      {/* --- Flame Wallet (Main) --- */}
      <section className="mx-auto my-32 max-w-360 px-5 md:px-16">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <div className="order-2 mt-12 flex flex-col justify-center md:order-1 md:col-span-4 md:col-start-2 md:mt-0">
            {/* --- ENTRY 1 --- */}
            <div
              ref={ref1}
              className={`${baseTransition} ${
                vis1
                  ? "translate-y-0 opacity-100 motion-safe:opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <span className="mb-4 block text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase">
                01 / Signature
              </span>
            </div>

            {/* --- ENTRY 2 --- */}
            <div
              ref={ref2}
              className={`${baseTransition} delay-150 ${
                vis2
                  ? "translate-y-0 opacity-100 motion-safe:opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h2 className="text-foreground mb-6 font-serif text-[32px] leading-[1.3]">
                The Flame Bifold
              </h2>
            </div>

            {/* --- ENTRY 3 --- */}
            <div
              ref={ref3}
              className={`${baseTransition} delay-300 ${
                vis3
                  ? "translate-y-0 opacity-100 motion-safe:opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <p className="mb-8 max-w-sm text-[18px] leading-[1.6] text-(--on-surface-variant)">
                Hand-embossed with a flame motif, this bifold is our signature
                piece. Full-grain leather that deepens with time. Six card
                slots, one unlined bill compartment.
              </p>
            </div>

            <Link
              href="#"
              className="text-foreground border-foreground inline-flex w-fit items-center gap-2 border-b pb-1 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300 hover:border-(--on-surface-variant) hover:text-(--on-surface-variant)"
            >
              Discover Flame
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="order-1 md:order-2 md:col-span-5 md:col-start-8">
            <div className="group will-change-opacity relative aspect-4/5 overflow-hidden border border-[rgba(138,121,104,0.2)] bg-(--surface-container) will-change-transform">
              {flameImage ? (
                <Image
                  src={flameImage}
                  alt="A handcrafted leather bifold wallet with an embossed flame design"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-(--on-surface-variant)">
                  Image placeholder
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Regular Wallet --- */}
      <section className="w-full bg-(--surface-container-low) py-32">
        <div className="mx-auto max-w-360 px-5 text-center md:px-16">
          {/* ENTRY 1 */}
          <div
            ref={ref4}
            className={`${baseTransition} delay-150 ${
              vis4
                ? "translate-y-0 opacity-100 motion-safe:opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <span className="mb-4 block text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase">
              02 / Classic
            </span>
          </div>

          {/* ENTRY 2 */}
          <div
            ref={ref5}
            className={`${baseTransition} delay-300 ${
              vis5
                ? "translate-y-0 opacity-100 motion-safe:opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-foreground mb-12 font-serif text-[32px] leading-[1.3]">
              The Regular Bifold
            </h2>
          </div>

          <div className="group will-change-opacity relative mx-auto aspect-video w-full max-w-5xl overflow-hidden border border-[rgba(138,121,104,0.2)] bg-(--surface-container) will-change-transform md:aspect-21/9">
            {regularImage ? (
              <Image
                src={regularImage}
                alt="A classic smooth leather bifold wallet in a natural tone"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                loading="lazy"
                className="bg-no-repeat object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-(--on-surface-variant)">
                Image placeholder
              </div>
            )}
          </div>

          <div className="mt-12">
            {/* ENTRY 3 */}
            <div
              ref={ref6}
              className={`${baseTransition} delay-500 ${
                vis6
                  ? "translate-y-0 opacity-100 motion-safe:opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <p className="mx-auto mb-8 max-w-2xl text-[18px] leading-[1.6] text-(--on-surface-variant)">
                Clean lines, no embellishment. A timeless bifold in full-grain
                leather for those who prefer understated elegance.
              </p>
            </div>

            <Link
              href="#"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background inline-flex items-center justify-center rounded-none border bg-transparent px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300"
            >
              View Classic
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
