import Link from "next/link";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const sections = [
  {
    id: "collecte",
    titre: "1. Données collectées",
    contenu: `Lors de votre inscription et utilisation de TalentProof, nous collectons les données suivantes :

Données d'identité : prénom, nom, genre, date de naissance, numéro de téléphone, adresse email.

Données professionnelles : métier, secteur d'activité, niveau d'expérience, compétences, salaire souhaité, disponibilité.

Données de contenu : photo de profil, vidéo de présentation, CV, diplômes, attestations, photos de réalisations.

Données de navigation : adresse IP, type d'appareil, pages visitées, durée des sessions.

Nous ne collectons que les données strictement nécessaires au fonctionnement de la plateforme.`,
  },
  {
    id: "utilisation",
    titre: "2. Utilisation des données",
    contenu: `Vos données sont utilisées exclusivement pour :

• Créer et gérer votre compte et votre profil
• Vous permettre d'être visible par les recruteurs (si vous avez activé le profil public)
• Améliorer les fonctionnalités de la plateforme
• Vous envoyer des notifications relatives à votre compte
• Assurer la sécurité et prévenir les fraudes

Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.`,
  },
  {
    id: "partage",
    titre: "3. Partage des données",
    contenu: `Vos données peuvent être partagées dans les cas suivants :

Avec les recruteurs et entreprises : si votre profil est public, les informations que vous avez choisies de rendre visibles sont accessibles aux recruteurs inscrits sur la plateforme.

Avec nos prestataires techniques : hébergement, base de données (Supabase) et autres services techniques indispensables au fonctionnement de TalentProof. Ces prestataires sont contractuellement tenus de protéger vos données.

En cas d'obligation légale : si la loi ou une autorité compétente l'exige.

Nous ne partageons jamais vos données avec des annonceurs publicitaires.`,
  },
  {
    id: "securite",
    titre: "4. Sécurité des données",
    contenu: `TalentProof met en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation.

Ces mesures comprennent notamment :
• Chiffrement des données en transit (HTTPS)
• Authentification par code PIN
• Accès restreint aux données selon les rôles
• Sauvegarde régulière des données

Cependant, aucun système n'est infaillible. En cas de violation de données susceptible de vous porter préjudice, nous vous en informerons dans les meilleurs délais.`,
  },
  {
    id: "droits",
    titre: "5. Vos droits",
    contenu: `Conformément aux lois applicables en matière de protection des données, vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données personnelles
• Droit de rectification : corriger des informations inexactes
• Droit à l'effacement : demander la suppression de vos données
• Droit à la portabilité : recevoir vos données dans un format structuré
• Droit d'opposition : vous opposer à certains traitements

Pour exercer ces droits, contactez-nous à contact@talentproof.africa. Nous traitons votre demande dans un délai de 30 jours ouvrables.

Vous pouvez également à tout moment modifier vos paramètres de confidentialité directement depuis votre tableau de bord.`,
  },
  {
    id: "contact",
    titre: "6. Nous contacter",
    contenu: `Pour toute question relative à la présente politique de confidentialité ou à la gestion de vos données personnelles, vous pouvez nous contacter :

• Email : contact@talentproof.africa
• WhatsApp : +225 05 07 93 97 06
• Via le formulaire de contact sur la page /contact

TalentProof Africa — Abidjan, Côte d'Ivoire
Dernière mise à jour : janvier 2025`,
  },
];

export default function ConfidentialitePage() {
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
              Politique de confidentialité
            </h1>
            <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto">
              Chez TalentProof, la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
            <p className="text-gray-500 text-sm mt-3">
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

        {/* CTA */}
        <section className="px-4 py-12" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-gray-600 mb-4">
              Des questions sur la protection de vos données ? Notre équipe est là pour vous répondre.
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
