import CraftsmanshipGrid from "@/features/homepage/components/CraftsmanshipGrid";
import HeroSection from "@/features/homepage/components/HeroSection";
import NavBar from "@/features/homepage/components/NavBar";
import ProductSection from "@/features/homepage/components/ProductSection";

export default function Home() {
  return (
    <main className="flex-1">
      <NavBar />
      <HeroSection />
      <div id="collection">
        <ProductSection />
      </div>
      <CraftsmanshipGrid />
    </main>
  );
}
