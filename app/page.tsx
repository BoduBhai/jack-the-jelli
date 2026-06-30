import {
  HeroSection,
  ProductSection,
  CraftsmanshipGrid,
  NavBar,
} from "@/components/homepage";

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
