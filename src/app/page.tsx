import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-enter">
      <Hero />
      <ProductSection />

      {/* Tagline */}
      <section className="py-24 md:py-40 px-4 bg-white">
        <p className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-center tracking-wide text-black">
          unmask them.
        </p>
      </section>

      <Footer />
    </div>
  );
}
