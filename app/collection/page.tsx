import type { Metadata } from "next";
import NavBar from "@/features/homepage/components/NavBar";
import CollectionHero from "@/features/products/components/CollectionHero";
import CollectionGrid from "@/features/products/components/CollectionGrid";

export const metadata: Metadata = {
  title: "The Collections | Jack The Jelli",
  description:
    "Discover our definitive selection of artisanal leather goods.",
};

export default function CollectionPage() {
  return (
    <main className="flex-1">
      <NavBar />
      <CollectionHero />
      <CollectionGrid />
    </main>
  );
}
