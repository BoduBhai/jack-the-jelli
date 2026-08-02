import Image from "next/image";

interface LogoProps {
  priority?: boolean;
}

export default function Logo({ priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="JACK THE JELLI"
      className="h-full w-auto object-contain"
      // priority is deprecated in Next 16 — see ProductGallery.tsx.
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      width={1242}
      height={742}
    />
  );
}
