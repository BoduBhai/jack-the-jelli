import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Camera, X } from "lucide-react";

interface ProductImage {
  src: string;
  label: string;
}

interface ProductMediaGalleryProps {
  images: ProductImage[];
}

function GalleryHeading({ className }: { className?: string }) {
  return (
    <div className={className}>
      <h3 className="font-heading text-foreground text-2xl font-medium">
        Product Media
      </h3>
      <p className="text-muted-foreground mt-1 text-sm">
        High-fidelity imagery reflecting the quiet luxury aesthetic.
      </p>
    </div>
  );
}

function ImageTile({
  src,
  label,
  removeButtonClassName,
}: ProductImage & { removeButtonClassName?: string }) {
  return (
    <div className="group bg-accent relative aspect-square w-full overflow-hidden">
      <Image
        src={src}
        alt="Product Thumbnail"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="secondary"
          className={cn("rounded-none p-2", removeButtonClassName)}
          aria-label="Remove image"
        >
          <X className="size-4" />
        </Button>
      </div>
      <span className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
        {label}
      </span>
    </div>
  );
}

function UploadTile() {
  return (
    <button
      type="button"
      className="group border-border text-muted-foreground hover:border-foreground hover:text-foreground flex aspect-square w-full flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors"
      aria-label="Upload new image"
    >
      <div className="relative">
        <Camera className="size-8" />
        <span className="bg-foreground text-background absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[8px]">
          +
        </span>
      </div>
      <span className="text-xs tracking-widest uppercase">Upload New</span>
    </button>
  );
}

export default function ProductMediaGallery({
  images,
}: ProductMediaGalleryProps) {
  return (
    <>
      {/* Mobile: horizontal carousel */}
      <div className="block w-full md:hidden">
        <GalleryHeading className="px-4 pt-4" />
        <Carousel className="relative px-4 pt-4">
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.label}>
                <ImageTile {...image} removeButtonClassName="p-3" />
              </CarouselItem>
            ))}
            <CarouselItem>
              <UploadTile />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-1" />
          <CarouselNext className="right-1" />
        </Carousel>
      </div>

      {/* Desktop: simple grid */}
      <div className="hidden w-2/5 flex-col px-6 py-12 md:block md:px-16">
        <GalleryHeading className="mb-8" />
        <div className="grid max-w-sm grid-cols-1 gap-6">
          {images.map((image) => (
            <ImageTile key={image.label} {...image} />
          ))}
          <UploadTile />
        </div>
      </div>
    </>
  );
}
