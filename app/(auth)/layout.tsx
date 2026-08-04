import Link from "next/link";
import Logo from "@/components/layout/Logo";

/**
 * Minimal chrome for register/login — just the mark and a way back to the
 * shop, not the full storefront NavBar (cart, search, category nav aren't
 * relevant mid-auth-flow). Mirrors how /admin opts out of (storefront)'s
 * layout via route group rather than a pathname check.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-12 px-6 py-16">
      <Link href="/" className="h-10">
        <Logo />
      </Link>
      {children}
    </div>
  );
}
