"use client";

import Image from "next/image";
import { Gem } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const craftsmanshipImages = {
  process:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAg53evmNUh5lPc7OLH_jsrJcbflg93XUXrnXb5pJRCSqpf4DxTZXDp6SLnwj7mISorCMlod3hCPnOTuAIBJ0-ngcUaGe1UszRQmFTuXTfp4qsvMfvGe_kH9U6eVWfrnVYUQqUqwfmUhYteTpzE4uJolWVm_IsLYdwclkL7v4j7jqJmA7JTX_2DT6nT6AhJaVpbKWsvrCwP5DnB3hLYstu_-80sTGt7LbkXlxmFdZ5XK-iCXtORGO1Sc2f3YMcDhNlOWFOmg2uq7mYm",
  stitching:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDkdtNQjEg9T1Y6HPA13wW-7q-gtF02Jdtc2PAD10PounPlI7AbNWZTiJFUjtZCIm_tihprLucLFXa_YXv3lVZB9ztzv4F3l4DNXVqhF-_0M_7NlkC0whlwGhT_eKhkwaIlfd1uS3-JzE1nMaDHh5Za1xrQF3CkDYZ6Ckj2x6lxkwi6Cad3xW_cUyCRJ_0Vc89EaRS7yxXihM-PaV2RvXqTuR192lvZE_n3gCFPjPX8ZovnH0vlGZSFr8_z3BGK1q_7ofP4J7vbzXgJ",
};

export default function CraftsmanshipGrid() {
  const { ref: ref1, isVisible: vis1 } = useInView({}, "-50px");
  const { ref: ref2, isVisible: vis2 } = useInView({}, "-50px");
  const { ref: ref3, isVisible: vis3 } = useInView({}, "-50px");

  return (
    <section
      id="craftsmanship"
      className="mx-auto max-w-360 px-5 py-32 md:px-16"
    >
      {/* Header */}
      <h2 className="text-foreground mb-12 text-center font-serif text-3xl leading-[1.3]">
        Uncompromising Quality
      </h2>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Large image box */}
        <div
          ref={ref1}
          className={`group relative overflow-hidden border border-[rgba(138,121,104,0.2)] transition-all duration-1000 md:h-125 ${vis1 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          {craftsmanshipImages.process ? (
            <Image
              src={craftsmanshipImages.process}
              alt="An artisan's workbench with a hand holding a leatherworking awl"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
              Image placeholder
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-8">
            <h3 className="mb-2 font-serif text-[32px] leading-[1.3] text-white">
              The Process
            </h3>
            <p className="text-[16px] leading-[1.6] text-white/80">
              Every piece takes time.
            </p>
          </div>
        </div>

        {/* Two stacked boxes */}
        <div className="grid h-full grid-rows-2 gap-8">
          {/* Icon + text box */}
          <div
            ref={ref2}
            className={`flex flex-1 flex-col justify-center border border-[rgba(138,121,104,0.2)] bg-(--surface-container) p-8 transition-shadow duration-300 hover:shadow-[0px_12px_32px_rgba(26,26,26,0.04)] ${vis2 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Gem className="text-foreground mb-6 h-8 w-8" />
            <h3 className="text-foreground mb-2 text-[18px] leading-[1.6] font-semibold">
              Vegetable Tanned
            </h3>
            <p className="text-[16px] leading-[1.6] text-(--on-surface-variant)">
              Sourced from the finest tanneries in Tuscany, utilizing organic
              tannins for a superior finish.
            </p>
          </div>

          {/* Stitching image box */}
          <div
            ref={ref3}
            className={`group relative aspect-2/1 flex-1 overflow-hidden border border-[rgba(138,121,104,0.2)] bg-(--surface-container) transition-all duration-1000 md:aspect-auto ${vis3 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            {craftsmanshipImages.stitching ? (
              <Image
                src={craftsmanshipImages.stitching}
                alt="Close up of perfectly aligned linen thread stitching on leather"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-(--on-surface-variant)">
                Image placeholder
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-8">
              <h3 className="text-[18px] leading-[1.6] font-semibold text-white">
                Saddle Stitched
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
