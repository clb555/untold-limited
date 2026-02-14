import Link from "next/link";
import Footer from "@/components/Footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-enter bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-wider text-black">
            UNTOLD.
          </Link>
          <Link
            href="/"
            className="text-[10px] tracking-[0.3em] uppercase text-gray-400 hover:text-black transition-colors font-body"
          >
            ← Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <article className="font-body [&_h1]:font-display [&_h1]:text-4xl [&_h1]:tracking-wide [&_h1]:mb-8 [&_h1]:text-black [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-wider [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-black [&_p]:text-gray-500 [&_p]:leading-relaxed [&_p]:text-sm [&_p]:mb-4 [&_ul]:text-gray-500 [&_ul]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_a]:text-black [&_a]:underline">
            {children}
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}
