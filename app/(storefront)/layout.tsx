import NavBar from "@/components/layout/NavBar";
import PageFade from "@/components/layout/PageFade";
import Footer from "@/features/homepage/components/Footer";

/**
 * Chrome shared by every storefront route. It lives here rather than inside
 * each page for two reasons: the nav survives client navigations instead of
 * remounting, and it stays on screen while `loading.tsx` or `error.tsx` is in
 * control — a page-level NavBar disappears the moment either takes over.
 *
 * The route group keeps `/admin` out without changing any URL.
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {/* Inside <main>, not around it: the fade wrapper remounts on every route
          change, and the landmark itself has to stay put. */}
      <main className="flex-1">
        <PageFade>{children}</PageFade>
      </main>
      <Footer />
    </>
  );
}
