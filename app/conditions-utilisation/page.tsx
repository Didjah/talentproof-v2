import Link from "next/link";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const sections = [
  {
    id: "acceptation",
    titre: "1. Acceptation des conditions",
    contenu: `En accédant à la plateforme TalentProof et en créant un compte, vous acceptez sans réserve les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.

TalentProof se réserve le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur la plateforme. Il vous appartient de consulter régulièrement cette page.`,
  },
  {
    id: "inscription",
    titre: "2. Inscription et compte",
    contenu: `Pour utiliser TalentProof, vous devez créer un compte en fournissant un numéro de téléphone valide et un code PIN à 4 chiffres. Vous êtes responsable de la confidentialité de vos identifiants.

Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription et tout au long de l'utilisation de la plateforme. TalentProof se réserve le droit de suspendre ou supprimer tout compte contenant des informations fausses ou trompeuses.

Un seul compte est autorisé par personne. La création de comptes multiples est interdite sauf autorisation expresse.`,
  },
  {
    id: "utilisation",
    titre: "3. Utilisation de la plateforme",
    contenu: `TalentProof est une plateforme de mise en relation entre talents et recruteurs. Vous vous engagez à l'utiliser de manière légale, honnête et respectueuse.

Il est strictement interdit de :
• Publier des contenus faux, trompeurs ou frauduleux
• Harceler, menacer ou insulter d'autres utilisateurs
• Utiliser la plateforme à des fins de spam ou de démarchage non sollicité
• Tenter de pirater ou compromettre la sécurité de la plateforme
• Copier, revendre ou exploiter commercialement le contenu d'autres utilisateurs sans leur accord

TalentProof peut à tout moment suspendre ou supprimer un compte qui ne respecte pas ces règles.`,
  },
  {
    id: "propriete",
    titre: "4. Propriété intellectuelle",
    contenu: `Le contenu que vous publiez sur TalentProof (photos, vidéos, textes, documents) vous appartient. En le publiant, vous accordez à TalentProof une licence non exclusive pour l'afficher sur la plateforme.

La marque « TalentProof », le logo, le design et l'ensemble du code source de la plateforme sont la propriété exclusive de TalentProof Africa et sont protégés par la législation applicable en matière de propriété intellectuelle.

Toute reproduction, représentation ou exploitation non autorisée de ces éléments est interdite.`,
  },
  {
    id: "responsabilite",
    titre: "5. Limitation de responsabilité",
    contenu: `TalentProof agit en qualité d'intermédiaire entre talents et recruteurs. La plateforme ne peut pas garantir l'exactitude ou l'authenticité des profils publiés, ni les résultats des mises en relation.

TalentProof ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme, des erreurs ou omissions dans les informations publiées, ou des relations établies entre utilisateurs.

La plateforme est fournie « en l'état » et peut être interrompue pour maintenance ou mise à jour sans préavis.`,
  },
  {
    id: "modification",
    titre: "6. Modification et résiliation",
    contenu: `TalentProof se réserve le droit de modifier, suspendre ou interrompre tout ou partie de la plateforme à tout moment, sans préavis et sans responsabilité envers les utilisateurs.

Vous pouvez résilier votre compte à tout moment en contactant notre équipe. À la clôture du compte, vos données seront supprimées conformément à notre politique de confidentialité.`,
  },
  {
    id: "contact",
    titre: "7. Nous contacter",
    contenu: `Pour toute question relative aux présentes conditions d'utilisation, vous pouvez nous contacter :

• Email : contact@talentproof.africa
• WhatsApp : +225 05 07 93 97 06
• Via le formulaire de contact disponible sur la page /contact

Ces conditions sont régies par les lois applicables en Côte d'Ivoire. Dernière mise à jour : janvier 2025.`,
  },
];

export default function ConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Annuaire</Link>
            <Link href="/a-propos" className="hover:text-[#1B3A6B] transition-colors">À propos</Link>
            <Link href="/contact" className="hover:text-[#1B3A6B] transition-colors">Contact</Link>
            <Link href="/aide" className="hover:text-[#1B3A6B] transition-colors">Aide</Link>
          </nav>
          <Link
            href="/inscription?role=talent"
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Créer mon profil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-14 text-center" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Légal
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: NAVY }}>
              Conditions d&apos;utilisation
            </h1>
            <p className="text-gray-500 text-sm">
              Dernière mise à jour : janvier 2025
            </p>
          </div>
        </section>

        {/* Sommaire */}
        <section className="px-4 pt-10 pb-0">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#EEF2F9] rounded-2xl p-6 border border-blue-100">
              <p className="text-sm font-bold mb-3" style={{ color: NAVY }}>Sommaire</p>
              <ol className="flex flex-col gap-1.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm hover:underline"
                      style={{ color: NAVY }}
                    >
                      {s.titre}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Contenu */}
        <section className="px-4 py-12">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {sections.map((s) => (
              <article
                key={s.id}
                id={s.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 scroll-mt-24"
              >
                <h2 className="text-base font-bold mb-4 pb-3 border-b border-gray-100" style={{ color: NAVY }}>
                  {s.titre}
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {s.contenu}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA aide */}
        <section className="px-4 py-12" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-gray-600 mb-4">
              Des questions sur nos conditions ? Notre équipe est disponible pour t&apos;aider.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <img src="/logo.png" alt="TalentProof" style={{ height: "40px", width: "auto" }} />
            <p className="text-white/70 text-sm leading-relaxed">
              La plateforme qui prouve que la compétence mérite d&apos;être vue.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Plateforme</p>
            <Link href="/annuaire" className="text-sm text-white/60 hover:text-white transition-colors">Annuaire</Link>
            <Link href="/inscription?role=talent" className="text-sm text-white/60 hover:text-white transition-colors">Créer mon profil</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Je suis…</p>
            <Link href="/inscription?role=talent" className="text-sm text-white/60 hover:text-white transition-colors">Un Talent</Link>
            <Link href="/inscription?role=recruteur" className="text-sm text-white/60 hover:text-white transition-colors">Un Recruteur</Link>
            <Link href="/inscription?role=entreprise" className="text-sm text-white/60 hover:text-white transition-colors">Une Entreprise</Link>
            <Link href="/inscription?role=centre" className="text-sm text-white/60 hover:text-white transition-colors">Un Centre de formation</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Informations</p>
            <Link href="/a-propos" className="text-sm text-white/60 hover:text-white transition-colors">À propos</Link>
            <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
            <Link href="/aide" className="text-sm text-white/60 hover:text-white transition-colors">Aide</Link>
            <Link href="/conditions-utilisation" className="text-sm text-white/60 hover:text-white transition-colors">Conditions d&apos;utilisation</Link>
            <Link href="/confidentialite" className="text-sm text-white/60 hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
            <span>© 2025 TalentProof Africa. Tous droits réservés.</span>
            <span>Fait avec ❤️ pour l&apos;Afrique</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
