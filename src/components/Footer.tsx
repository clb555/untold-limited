import Link from "next/link";
import { SITE } from "@/lib/constants";

const legalLinks = [
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/privacy", label: "Confidentialité" },
  { href: "/legal/mentions", label: "Mentions légales" },
];

export default function Footer() {
  return (
    <footer className="relative mt-32">
      {/* Divider */}
      <hr className="divider" />

      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-display text-2xl tracking-wider text-black">
              UNTOLD.
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-body">
              Unmask them.
            </span>
          </div>

          {/* Legal links */}
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {legalLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-black transition-colors duration-300 font-body py-1"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <a
              href={`mailto:${SITE.email}`}
              className="text-xs text-gray-400 hover:text-black transition-colors duration-300 font-body"
            >
              {SITE.email}
            </a>
            <span className="text-[10px] text-gray-300 font-body">
              {new Date().getFullYear()} UNTOLD. Tous droits réservés.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
