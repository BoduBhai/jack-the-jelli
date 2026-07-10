"use client";

import { usePathname } from "next/navigation";
import Footer from "@/features/homepage/components/Footer";

export default function ClientFooter() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return !isAdmin ? <Footer /> : null;
}
