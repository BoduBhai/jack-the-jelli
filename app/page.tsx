import CraftsmanshipGrid from "@/components/homepage/CraftsmanshipGrid";
import HeroSection from "@/components/homepage/HeroSection";
import NavBar from "@/components/homepage/NavBar";
import ProductSection from "@/components/homepage/ProductSection";

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
