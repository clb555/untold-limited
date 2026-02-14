import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Mentions légales – ${SITE.name}`,
};

export default function MentionsPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p>
        <em>Dernière mise à jour : février 2026</em>
      </p>

      <h2>1. Éditeur du site</h2>
      <p>
        Le site {SITE.url} est édité par UNTOLD.
      </p>
      <p>
        Email de contact :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
      </p>
      <p>
        {/* TODO (OBLIGATOIRE AVANT MISE EN LIGNE) :
            Remplacer les "[À compléter]" ci-dessous par les vraies informations légales.
            Ces mentions sont obligatoires en France (article 6 de la LCEN).
            Sans ces informations, le site n'est pas conforme à la loi. */}
        Numéro SIRET : [À compléter]
        <br />
        Forme juridique : [À compléter]
        <br />
        Adresse du siège social : [À compléter]
        <br />
        Directeur de la publication : [À compléter]
      </p>

      <h2>2. Hébergeur</h2>
      <p>
        Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
        91789, États-Unis.
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site (textes, images, graphismes, logo,
        icônes, animations, logiciels) est la propriété exclusive d&apos;UNTOLD,
        sauf mention contraire. Toute reproduction, représentation,
        modification, publication, adaptation de tout ou partie des éléments du
        site est interdite sans autorisation écrite préalable.
      </p>

      <h2>4. Limitation de responsabilité</h2>
      <p>
        UNTOLD s&apos;efforce de fournir des informations aussi précises que
        possible. Toutefois, UNTOLD ne pourra être tenu responsable des
        omissions, inexactitudes et carences dans la mise à jour, qu&apos;elles
        soient de son fait ou du fait des tiers partenaires qui lui fournissent
        ces informations.
      </p>

      <h2>5. Droit applicable</h2>
      <p>
        Le présent site et ses conditions d&apos;utilisation sont régis par le
        droit français. En cas de litige, les tribunaux français seront seuls
        compétents.
      </p>
    </>
  );
}
