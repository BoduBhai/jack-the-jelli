"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  /** Already resolved by the caller — never empty. */
  images: { url: string }[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div className="flex flex-col gap-2">
      <Carousel
        setApi={setApi}
        opts={{ loop: hasMultiple, active: hasMultiple }}
        className="w-full"
        aria-label={`${alt} — product images`}
      >
        <CarouselContent className="ml-0">
          {images.map((image, i) => (
            <CarouselItem key={`${image.url}-${i}`} className="pl-0">
              <div className="bg-surface-container relative aspect-4/5 overflow-hidden">
                <Image
                  src={image.url}
                  alt={
                    hasMultiple
                      ? `${alt} — view ${i + 1} of ${images.length}`
                      : alt
                  }
                  fill
                  // Only the visible slide loads up front — see the multi-image
                  // note in next/image's docs (priority is deprecated in 16).
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {hasMultiple && (
          <>
            <CarouselPrevious
              variant="ghost"
              size="icon"
              className="bg-background/80 text-foreground hover:bg-foreground hover:text-background left-4 size-10 rounded-none transition-colors duration-300 disabled:opacity-40"
            />
            <CarouselNext
              variant="ghost"
              size="icon"
              className="bg-background/80 text-foreground hover:bg-foreground hover:text-background right-4 size-10 rounded-none transition-colors duration-300 disabled:opacity-40"
            />
          </>
        )}
      </Carousel>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, i) => (
            <button
              key={`thumb-${image.url}-${i}`}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === current}
              className={cn(
                "bg-surface-container relative aspect-square overflow-hidden border transition-opacity duration-300",
                i === current
                  ? "border-foreground opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
