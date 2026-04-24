import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export const revalidate = 3600;

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const profiles = [
  { emoji: "🧑‍💼", label: "Talent", desc: "Montre tes compétences réelles", role: "talent" },
  { emoji: "🔍", label: "Recruteur", desc: "Trouve les bons profils rapidement", role: "recruteur" },
  { emoji: "🏢", label: "Entreprise", desc: "Gérez vos besoins en recrutement", role: "entreprise" },
  { emoji: "🎓", label: "Centre de formation", desc: "Valorisez vos apprenants", role: "centre" },
];

const examples = ["Gardien", "Ménagère", "Chauffeur", "Artisan", "Technicien", "Autodidacte"];

const DISPO: Record<string, { label: string; cls: string }> = {
  "immédiate":  { label: "Dispo. immédiate", cls: "bg-blue-100 text-blue-800" },
  "1 mois":     { label: "Dispo. 1 mois",    cls: "bg-orange-100 text-orange-700" },
  "négociable": { label: "Négociable",        cls: "bg-gray-100 text-gray-600" },
};

interface TalentVedette {
  id: string;
  utilisateur_id: string;
  metier_principal: string;
  disponibilite: string;
  avatar_url: string | null;
  has_video: boolean | null;
  utilisateurs: { prenom: string; nom: string; pays: string; ville: string } | null;
}

function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

export default async function Home() {
  const { data } = await supabase
    .from("talents")
    .select(`
      id,
      utilisateur_id,
      metier_principal,
      disponibilite,
      avatar_url,
      has_video,
      utilisateurs (
        prenom,
        nom,
        pays,
        ville
      )
    `)
    .eq("profil_public", true)
    .order("id", { ascending: false })
    .limit(6);

  const vedettes = (data ?? []) as unknown as TalentVedette[];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="TalentProof" style={{ height: '36px', width: 'auto' }} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Annuaire</Link>
            <Link href="/recruteur" className="hover:text-[#1B3A6B] transition-colors">Espace Recruteur</Link>
            <Link href="/partenaire" className="hover:text-[#1B3A6B] transition-colors">Devenir Partenaire</Link>
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
        <section className="px-4 py-20 text-center" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight" style={{ color: NAVY }}>
              Diplômé, certifié, autodidacte —<br className="hidden sm:block" />
              ta preuve, c&apos;est ce que tu sais faire.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
              TalentProof permet à chacun de montrer ses compétences réelles avec vidéos, photos, diplômes, CV et salaire souhaité sur un seul profil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/inscription?role=talent"
                className="rounded-full px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                Créer mon profil
              </Link>
              <Link
                href="/annuaire"
                className="rounded-full px-8 py-3 text-base font-semibold border-2 transition-colors hover:bg-[#1B3A6B] hover:text-white"
                style={{ borderColor: NAVY, color: NAVY }}
              >
                Voir l&apos;annuaire
              </Link>
            </div>
          </div>
        </section>

        {/* Ouvert à tous */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: NAVY }}>
              Ouvert à tous
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Avec ou sans diplôme, toute personne ayant une compétence réelle peut s&apos;inscrire.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {examples.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#1B3A6B]/20 bg-[#EEF2F9] py-5 px-4 text-sm font-semibold text-[#1B3A6B]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Profils en avant */}
        {vedettes.length > 0 && (
          <section className="px-4 py-16" style={{ backgroundColor: "#EEF2F9" }}>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ color: NAVY }}>
                Ils ont déjà leur profil TalentProof
              </h2>
              <p className="text-center text-gray-500 text-sm mb-10">
                Des talents vérifiés, prêts à être recrutés
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {vedettes.map((talent) => {
                  const prenom = talent.utilisateurs?.prenom ?? "";
                  const nom = talent.utilisateurs?.nom ?? "";
                  const nomComplet = `${prenom} ${nom}`.trim() || "Talent";
                  const lieu = [talent.utilisateurs?.ville, talent.utilisateurs?.pays].filter(Boolean).join(", ");
                  const dispo = DISPO[talent.disponibilite] ?? DISPO["négociable"];

                  return (
                    <div
                      key={talent.id}
                      className="bg-white rounded-2xl border border-[#1B3A6B]/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                    >
                      {/* Bandeau supérieur */}
                      <div className="h-2 w-full" style={{ backgroundColor: NAVY }} />

                      <div className="p-5 flex flex-col gap-3 flex-1">
                        {/* Avatar + identité */}
                        <div className="flex items-center gap-3">
                          {talent.avatar_url ? (
                            <img
                              src={talent.avatar_url}
                              alt={nomComplet}
                              className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[#1B3A6B]/20"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white text-base font-bold"
                              style={{ backgroundColor: NAVY }}
                            >
                              {initiales(prenom, nom)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{nomComplet}</p>
                            <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
                              {talent.metier_principal || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Localisation */}
                        {lieu && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>📍</span> {lieu}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${dispo.cls}`}>
                            {dispo.label}
                          </span>
                          {talent.has_video && (
                            <span className="text-xs font-semibold bg-blue-50 text-blue-600 rounded-full px-2.5 py-1">
                              ✓ Vidéo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bouton */}
                      <div className="px-5 pb-5">
                        <Link
                          href={`/profil/${talent.utilisateur_id}`}
                          className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: GOLD }}
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <Link
                  href="/annuaire"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#1B3A6B] text-[#1B3A6B] px-8 py-3 text-sm font-semibold transition-colors hover:bg-[#1B3A6B] hover:text-white"
                >
                  Voir tous les profils →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Choix de profil */}
        <section className="px-4 py-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ color: NAVY }}>
              Qui êtes-vous ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {profiles.map(({ emoji, label, desc, role }) => (
                <Link
                  key={role}
                  href={`/inscription?role=${role}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-[#EEF2F9] p-8 text-center shadow-sm transition-all hover:border-[#1B3A6B] hover:shadow-md"
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="text-lg font-bold" style={{ color: NAVY }}>{label}</span>
                  <span className="text-sm text-gray-500">{desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-white" style={{ backgroundColor: NAVY }}>
        TalentProof — la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
