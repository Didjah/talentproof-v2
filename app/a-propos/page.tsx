import Link from "next/link";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const valeurs = [
  {
    emoji: "🤝",
    titre: "Accessibilité",
    desc: "Ouvert à tous, diplômé ou non. Chaque compétence réelle mérite d'être vue et reconnue.",
  },
  {
    emoji: "🔍",
    titre: "Transparence",
    desc: "Des profils vérifiés avec preuves concrètes. Zéro mensonge, zéro flou — juste la réalité.",
  },
  {
    emoji: "⭐",
    titre: "Excellence",
    desc: "Nous encourageons chaque talent à se présenter au meilleur de lui-même, avec ambition.",
  },
  {
    emoji: "🌍",
    titre: "Inclusion",
    desc: "Du Sénégal au Kenya, de la Côte d'Ivoire au Cameroun — TalentProof est pour toute l'Afrique.",
  },
];

export default function AProposPage() {
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
            <Link href="/a-propos" className="font-semibold transition-colors" style={{ color: NAVY }}>À propos</Link>
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
        <section className="px-4 py-16 text-center" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Qui sommes-nous
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-5 leading-tight" style={{ color: NAVY }}>
              À propos de TalentProof
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Nous construisons la plateforme qui donne enfin de la visibilité aux travailleurs africains — diplômés ou autodidactes.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Notre mission</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ color: NAVY }}>
                Rendre chaque compétence visible
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Donner de la visibilité aux travailleurs africains, diplômés ou non, grâce à des profils riches en preuves visuelles.
              </p>
              <p className="text-gray-600 leading-relaxed">
                En Afrique, des millions de personnes possèdent des compétences réelles mais manquent d&apos;un outil pour les prouver. TalentProof comble ce vide : un profil, une vidéo, une photo — et ta valeur parle d&apos;elle-même.
              </p>
            </div>
            <div
              className="rounded-3xl p-8 flex flex-col gap-5 text-white"
              style={{ backgroundColor: NAVY }}
            >
              <span className="text-5xl">🎯</span>
              <p className="text-xl font-bold leading-snug">
                &ldquo;La compétence mérite d&apos;être vue, pas seulement déclarée.&rdquo;
              </p>
              <p className="text-white/60 text-sm">— L&apos;équipe TalentProof</p>
            </div>
          </div>
        </section>

        {/* Histoire */}
        <section className="px-4 py-16" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>Nos origines</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: NAVY }}>Notre histoire</h2>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-5">
              <div className="flex gap-4">
                <span className="text-3xl shrink-0">🌍</span>
                <p className="text-gray-700 leading-relaxed">
                  TalentProof est née en <strong>Côte d&apos;Ivoire</strong>, portée par le constat simple que trop de talents africains restaient invisibles faute d&apos;un profil adapté à la réalité locale.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl shrink-0">💡</span>
                <p className="text-gray-700 leading-relaxed">
                  Dans un contexte où le CV papier ne suffit plus et où les plateformes mondiales ignorent les spécificités africaines, il fallait créer un outil pensé <strong>pour l&apos;Afrique, par l&apos;Afrique</strong>.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl shrink-0">🚀</span>
                <p className="text-gray-700 leading-relaxed">
                  Depuis son lancement, TalentProof s&apos;est étendue à toute l&apos;Afrique subsaharienne et continue de grandir, un talent à la fois. Notre ambition : devenir la référence du marché de l&apos;emploi africain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>Ce en quoi nous croyons</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ color: NAVY }}>Nos valeurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {valeurs.map(({ emoji, titre, desc }) => (
                <div
                  key={titre}
                  className="flex items-start gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl shrink-0">{emoji}</span>
                  <div>
                    <p className="text-base font-bold mb-1" style={{ color: NAVY }}>{titre}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Équipe */}
        <section className="px-4 py-16" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Les gens derrière le projet</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ color: NAVY }}>L&apos;équipe</h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Une équipe passionnée par l&apos;Afrique et l&apos;emploi, convaincue que chaque travailleur mérite une chance équitable d&apos;être découvert et valorisé.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { emoji: "💻", label: "Tech & Développement" },
                { emoji: "🎨", label: "Design & UX" },
                { emoji: "📣", label: "Marketing & Croissance" },
                { emoji: "🤝", label: "Partenariats" },
              ].map(({ emoji, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-white border-2 shadow-sm"
                  style={{ borderColor: NAVY, color: NAVY }}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20" style={{ backgroundColor: NAVY }}>
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Rejoins l&apos;aventure TalentProof
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-lg">
              Crée ton profil gratuitement et commence à être visible dès aujourd&apos;hui. Des recruteurs attendent de te découvrir.
            </p>
            <Link
              href="/inscription"
              className="rounded-full px-8 py-3.5 text-base font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              Rejoindre TalentProof →
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
