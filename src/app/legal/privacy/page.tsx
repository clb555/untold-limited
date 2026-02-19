import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Politique de confidentialité – ${SITE.name}`,
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>

      <h2>1. Données collectées</h2>
      <p>
        Lors de votre commande, nous collectons : nom, adresse email, adresse
        de livraison. Les informations de paiement sont traitées directement
        par Stripe et ne transitent jamais par nos serveurs.
      </p>

      <h2>2. Utilisation</h2>
      <p>
        Vos données servent uniquement au traitement et à l&apos;expédition de
        votre commande. Elles sont partagées avec Stripe (paiement) et notre
        imprimeur (fabrication et livraison). Vos données ne sont jamais
        vendues.
      </p>

      <h2>3. Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès, la rectification ou la suppression
        de vos données en nous contactant à{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
        .
      </p>

      <h2>4. Cookies</h2>
      <p>
        Le site utilise uniquement les cookies nécessaires au fonctionnement
        du paiement. Aucun cookie publicitaire ou de tracking.
      </p>
    </>
  );
}
