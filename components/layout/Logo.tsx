import Image from "next/image";

interface LogoProps {
  priority?: boolean;
}

export default function Logo({ priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="JACK THE JELLI"
      className="h-auto w-full object-contain"
      priority={priority}
      width={150}
      height={150}
    />
  );
}
