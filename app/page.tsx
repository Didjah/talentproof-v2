import Link from "next/link";

const GREEN = "#1a5c3a";

const profiles = [
  { emoji: "🧑‍💼", label: "Talent", desc: "Montre tes compétences réelles", role: "talent" },
  { emoji: "🔍", label: "Recruteur", desc: "Trouve les bons profils rapidement", role: "recruteur" },
  { emoji: "🏢", label: "Entreprise", desc: "Gérez vos besoins en recrutement", role: "entreprise" },
  { emoji: "🎓", label: "Centre de formation", desc: "Valorisez vos apprenants", role: "centre" },
];

const examples = ["Gardien", "Ménagère", "Chauffeur", "Artisan", "Technicien", "Autodidacte"];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tight" style={{ color: GREEN }}>
            TalentProof
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="hover:text-[#1a5c3a] transition-colors">Annuaire</Link>
            <Link href="/recruteur" className="hover:text-[#1a5c3a] transition-colors">Espace Recruteur</Link>
            <Link href="/partenaire" className="hover:text-[#1a5c3a] transition-colors">Devenir Partenaire</Link>
          </nav>
          <Link
            href="/inscription?role=talent"
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN }}
          >
            Créer mon profil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-20 text-center" style={{ backgroundColor: "#f0f7f3" }}>
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight" style={{ color: GREEN }}>
              Diplômé, certifié, autodidacte —<br className="hidden sm:block" />
              ta preuve, c'est ce que tu sais faire.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
              TalentProof permet à chacun de montrer ses compétences réelles avec vidéos, photos, diplômes, CV et salaire souhaité sur un seul profil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/inscription?role=talent"
                className="rounded-full px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                Créer mon profil
              </Link>
              <Link
                href="/annuaire"
                className="rounded-full px-8 py-3 text-base font-semibold border-2 transition-colors hover:bg-[#1a5c3a] hover:text-white"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                Voir l'annuaire
              </Link>
            </div>
          </div>
        </section>

        {/* Ouvert à tous */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: GREEN }}>
              Ouvert à tous
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Avec ou sans diplôme, toute personne ayant une compétence réelle peut s'inscrire.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {examples.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#1a5c3a]/20 bg-[#f0f7f3] py-5 px-4 text-sm font-semibold text-[#1a5c3a]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Choix de profil */}
        <section className="px-4 py-16" style={{ backgroundColor: "#f0f7f3" }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ color: GREEN }}>
              Qui êtes-vous ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {profiles.map(({ emoji, label, desc, role }) => (
                <Link
                  key={role}
                  href={`/inscription?role=${role}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-white p-8 text-center shadow-sm transition-all hover:border-[#1a5c3a] hover:shadow-md"
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="text-lg font-bold" style={{ color: GREEN }}>{label}</span>
                  <span className="text-sm text-gray-500">{desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-white" style={{ backgroundColor: GREEN }}>
        TalentProof — la preuve que la compétence mérite d'être vue.
      </footer>
    </div>
  );
}
