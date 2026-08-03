import CraftsmanshipGrid from "@/features/homepage/components/CraftsmanshipGrid";
import HeroSection from "@/features/homepage/components/HeroSection";
import ProductSection from "@/features/homepage/components/ProductSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div id="collection">
        <ProductSection />
      </div>
      <CraftsmanshipGrid />
    </>
  );
}
