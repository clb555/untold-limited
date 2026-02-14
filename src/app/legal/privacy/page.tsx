import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Politique de confidentialité – ${SITE.name}`,
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>
        <em>Dernière mise à jour : février 2026</em>
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données personnelles est UNTOLD,
        joignable à l&apos;adresse :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
        .
      </p>

      <h2>2. Données collectées</h2>
      <p>
        Dans le cadre de votre commande, nous collectons les données suivantes :
        nom, prénom, adresse email, adresse postale de livraison, et
        informations de paiement (traitées exclusivement par Stripe).
      </p>

      <h2>3. Finalité du traitement</h2>
      <p>
        Vos données sont collectées pour : le traitement et l&apos;expédition de
        votre commande, la communication relative à votre commande (confirmation,
        suivi), et le respect de nos obligations légales et comptables.
      </p>

      <h2>4. Partage des données</h2>
      <p>
        Vos données peuvent être partagées avec : Stripe (traitement du
        paiement), notre partenaire d&apos;impression et d&apos;expédition
        (Print on Demand), et les transporteurs pour la livraison. Vos données
        ne sont jamais vendues à des tiers.
      </p>

      <h2>5. Durée de conservation</h2>
      <p>
        Vos données sont conservées pour la durée nécessaire au traitement de
        votre commande et aux obligations légales (comptabilité, fiscalité), soit
        un maximum de 3 ans après la dernière interaction.
      </p>

      <h2>6. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez des droits suivants : accès,
        rectification, suppression, limitation du traitement, portabilité, et
        opposition. Pour exercer ces droits, contactez-nous à :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
        .
      </p>

      <h2>7. Cookies</h2>
      <p>
        Le site utilise uniquement les cookies strictement nécessaires au
        fonctionnement du service (session, paiement). Aucun cookie publicitaire
        ou de tracking n&apos;est utilisé.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question :{" "}
        <a href={`mailto:${SITE.email}`} className="underline">
          {SITE.email}
        </a>
      </p>
    </>
  );
}
