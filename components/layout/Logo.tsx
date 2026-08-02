import Image from "next/image";

interface LogoProps {
  priority?: boolean;
  /**
   * Pass `""` when the logo sits inside an already-labelled link or button —
   * otherwise screen readers announce the brand twice, once for the control's
   * own name and once for this image.
   */
  alt?: string;
}

export default function Logo({
  priority = false,
  alt = "JACK THE JELLI",
}: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt={alt}
      className="h-full w-auto object-contain"
      // priority is deprecated in Next 16 — see ProductGallery.tsx.
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      width={1242}
      height={742}
    />
  );
}
