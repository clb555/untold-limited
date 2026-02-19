import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Mentions légales – ${SITE.name}`,
};

export default function MentionsPage() {
  return (
    <>
      <h1>Mentions légales</h1>

      <h2>1. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus du site (textes, visuels, logos, designs)
        est la propriété exclusive d&apos;UNTOLD. Toute reproduction ou
        utilisation sans autorisation écrite est interdite.
      </p>

      <h2>2. Droit applicable</h2>
      <p>
        Le présent site et ses conditions d&apos;utilisation sont régis par le
        droit français. Tout litige sera soumis aux tribunaux compétents de
        Paris.
      </p>

      <h2>3. Contact</h2>
      <p>
        Pour toute question :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
      </p>
    </>
  );
}
