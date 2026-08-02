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
      priority={priority}
      width={1242}
      height={742}
    />
  );
}
