import { SITE, PRODUCT } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `CGV – ${SITE.name}`,
};

export default function CGVPage() {
  return (
    <>
      <h1>Conditions Générales de Vente</h1>

      <h2>1. Produit et prix</h2>
      <p>
        Le site propose des t-shirts en édition limitée, fabriqués à la
        demande après validation de la commande. Le prix affiché est en euros
        TTC, livraison incluse.
      </p>

      <h2>2. Commande et paiement</h2>
      <p>
        Le paiement s&apos;effectue par carte bancaire via Stripe. La commande
        est définitive après confirmation du paiement. Les données bancaires
        ne sont jamais stockées sur nos serveurs.
      </p>

      <h2>3. Livraison</h2>
      <p>
        Les produits sont imprimés et expédiés par notre partenaire de
        fabrication. Délai estimé : {PRODUCT.shippingDelay} après confirmation.
      </p>

      <h2>4. Rétractation</h2>
      <p>
        Droit de rétractation de 14 jours après réception. Les produits
        fabriqués sur mesure peuvent en être exclus. Contact :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
      </p>
    </>
  );
}
