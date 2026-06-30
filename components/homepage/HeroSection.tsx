"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";
import Link from "next/link";

const heroImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuARMGujTktlu3ROV4FR2VKopFBVYoQ9OkRtDLdDwjYJxpweMmL7rQlepJ73nwljLGW_lJg4RkN7hcBUBcribP0uocs9BClmmhcF2N5HrBFluELb334X44AXWVpH5JJ5ZTwprA5qcSRe5fSLW3CjzRQ5eUJsjllPxmMpC04rl1JKdCG_efWyobsXBFC8KYDzp3vMMXdqutoAwQwnrMUEbxk_Cl0VoXj_5-AsiGRh1l75buHVSYqGeWhuZdjkWrcwms8uEbHXdH5t3K9n",
];

export default function HeroSection() {
  const { ref: ref1, isVisible: vis1 } = useInView({}, "-50px");
  const { ref: ref2, isVisible: vis2 } = useInView({}, "-50px");
  const { ref: ref3, isVisible: vis3 } = useInView({}, "-50px");

  return (
    <header className="relative flex h-screen min-h-200 w-screen items-center justify-center overflow-hidden bg-(--surface-container)">
      {/* Background image */}
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={heroImages[0]}
          alt="A cinematic, high-end editorial close-up of a handcrafted leather wallet on a stone pedestal"
          fill
          sizes="100vw"
          className="origin-center scale-105 object-cover transition-transform duration-[10s] ease-out hover:scale-100"
          priority
          unoptimized
        />
        <div className="from-background/40 absolute inset-0 bg-linear-to-t to-transparent" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto w-full max-w-360 px-5 text-center md:px-16">
        <div
          ref={ref1}
          className={`transition-all duration-1000 ${vis1 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <span className="text-foreground/80 mb-6 block text-[12px] font-semibold tracking-[0.2em] uppercase">
            The Heritage Collection
          </span>
        </div>

        <div
          ref={ref2}
          className={`transition-all delay-100 duration-1000 ${vis2 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <h1
            className="text-foreground mx-auto mb-8 max-w-3xl font-serif text-[40px] leading-[1.1] md:text-[64px] md:leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Quiet Craftsmanship.
            <br className="hidden md:block" />
            Endless Character.
          </h1>
        </div>

        <div
          ref={ref3}
          className={`transition-all delay-200 duration-1000 ${vis3 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Link
            href="#collection"
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center justify-center rounded-none px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </header>
  );
}
