import { SITE, PRODUCT } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `CGV – ${SITE.name}`,
};

export default function CGVPage() {
  return (
    <>
      <h1>Conditions Générales de Vente</h1>
      <p>
        <em>Dernière mise à jour : février 2026</em>
      </p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente (CGV) régissent les ventes
        de produits effectuées sur le site {SITE.url}, exploité par UNTOLD
        (ci-après « le Vendeur »). Toute commande implique l&apos;acceptation
        sans réserve des présentes CGV.
      </p>

      <h2>2. Produits</h2>
      <p>
        Le site propose à la vente des t-shirts en édition limitée. Les
        produits sont fabriqués à la demande (Print on Demand) et imprimés après
        validation de la commande. Les photographies et descriptions des
        produits sont aussi fidèles que possible mais ne sauraient engager la
        responsabilité du Vendeur.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises (TTC). Les
        frais de livraison sont inclus dans le prix affiché. Le Vendeur se
        réserve le droit de modifier ses prix à tout moment, les produits étant
        facturés au prix en vigueur lors de la validation de la commande.
      </p>

      <h2>4. Commande</h2>
      <p>
        L&apos;acheteur sélectionne la taille souhaitée et procède au paiement
        via la plateforme sécurisée Stripe. La commande est définitive après
        confirmation du paiement. Un email de confirmation est envoyé à
        l&apos;adresse fournie.
      </p>

      <h2>5. Paiement</h2>
      <p>
        Le paiement s&apos;effectue par carte bancaire via Stripe. Les données
        de paiement sont traitées de manière sécurisée et ne sont jamais
        stockées sur nos serveurs.
      </p>

      <h2>6. Livraison</h2>
      <p>
        Les produits sont imprimés et expédiés par notre partenaire de
        fabrication. Le délai de livraison estimé est de {PRODUCT.shippingDelay}{" "}
        à compter de la confirmation de commande. Ce délai inclut le temps
        d&apos;impression et d&apos;expédition. Le Vendeur ne saurait être tenu
        responsable des retards imputables au transporteur.
      </p>

      <h2>7. Droit de rétractation</h2>
      <p>
        Conformément à la législation en vigueur, l&apos;acheteur dispose
        d&apos;un délai de 14 jours à compter de la réception du produit pour
        exercer son droit de rétractation. Les produits fabriqués sur mesure ou
        personnalisés peuvent être exclus du droit de rétractation. Pour toute
        demande, contacter :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
        .
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative à une commande :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
      </p>
    </>
  );
}
