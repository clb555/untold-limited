import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-enter">
      <Hero />
      <ProductSection />
      <Footer />
    </div>
  );
}
