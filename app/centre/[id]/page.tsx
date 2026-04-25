"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

interface Formation {
  nom: string;
  duree: string;
  prix: string;
  niveau: string;
}

interface Apprenant {
  id: string;
  talent_utilisateur_id: string | null;
  competence_acquise: string | null;
  temoignage: string | null;
  talents: {
    avatar_url: string | null;
    utilisateurs: { prenom: string; nom: string } | null;
  } | null;
}

interface Centre {
  id: string;
  utilisateur_id: string;
  nom_centre: string;
  domaine_formation: string | null;
  annee_creation: number | null;
  pays: string | null;
  ville: string | null;
  adresse: string | null;
  logo_url: string | null;
  description: string | null;
  mission: string | null;
  vision: string | null;
  taux_reussite: string | null;
  mode_formation: string | null;
  public_cible: string | null;
  formations: Formation[] | null;
  telephone: string | null;
  whatsapp: string | null;
  email: string | null;
  verifie: boolean | null;
}

function initiales(nom: string) {
  return nom
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

function initFromNames(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

export default function CentrePage() {
  const { id } = useParams<{ id: string }>();
  const [centre, setCentre] = useState<Centre | null>(null);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: centreData } = await supabase
        .from("centres_formation")
        .select("*")
        .eq("utilisateur_id", id)
        .single();

      setCentre(centreData as Centre | null);

      // apprenants table may not exist yet — ignore errors
      try {
        const { data: appData, error } = await supabase
          .from("apprenants")
          .select(`
            id,
            talent_utilisateur_id,
            competence_acquise,
            temoignage,
            talents (
              avatar_url,
              utilisateurs (
                prenom,
                nom
              )
            )
          `)
          .eq("centre_utilisateur_id", id)
          .limit(6);

        if (!error && appData) {
          setApprenants(appData as unknown as Apprenant[]);
        }
      } catch {
        // table doesn't exist yet, silently skip
      }

      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-[#1B3A6B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={{ backgroundColor: "#EEF2F9" }}>
        <p className="text-2xl font-bold" style={{ color: NAVY }}>Centre introuvable</p>
        <p className="text-gray-500 text-sm">Ce profil n&apos;existe pas ou n&apos;est pas encore publié.</p>
        <Link href="/" className="rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: NAVY }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const lieu = [centre.ville, centre.pays].filter(Boolean).join(", ");
  const formations: Formation[] = Array.isArray(centre.formations) ? centre.formations : [];
  const hasPresentation = centre.description || centre.mission || centre.vision;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
          <Link
            href="/inscription?role=talent"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: GOLD }}
          >
            Créer mon profil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* En-tête centre */}
        <section className="px-4 py-12" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo ou initiales */}
            {centre.logo_url ? (
              <img
                src={centre.logo_url}
                alt={centre.nom_centre}
                className="w-24 h-24 rounded-2xl object-contain bg-white border border-gray-200 shadow-sm shrink-0"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                style={{ backgroundColor: NAVY }}
              >
                {initiales(centre.nom_centre)}
              </div>
            )}

            {/* Identité */}
            <div className="flex flex-col gap-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{ color: NAVY }}>
                  {centre.nom_centre}
                </h1>
                {centre.verifie && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    ✓ Vérifié
                  </span>
                )}
              </div>

              {/* Méta-infos */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-gray-600">
                {centre.domaine_formation && <span>🎓 {centre.domaine_formation}</span>}
                {centre.annee_creation && <span>📅 Fondé en {centre.annee_creation}</span>}
              </div>
              {lieu && (
                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                  <span>📍</span> {lieu}
                </p>
              )}

              {/* Statistiques */}
              {centre.taux_reussite && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-1">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-xl font-extrabold" style={{ color: GOLD }}>
                      {centre.taux_reussite}
                    </span>
                    <span className="text-xs text-gray-500">Taux de réussite</span>
                  </div>
                  {apprenants.length > 0 && (
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-xl font-extrabold" style={{ color: GOLD }}>
                        {apprenants.length}+
                      </span>
                      <span className="text-xs text-gray-500">Apprenants</span>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons contact rapide */}
              {(centre.whatsapp || centre.email) && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                  {centre.whatsapp && (
                    <a
                      href={`https://wa.me/${centre.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      📲 WhatsApp
                    </a>
                  )}
                  {centre.email && (
                    <a
                      href={`mailto:${centre.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: NAVY }}
                    >
                      ✉️ Email
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-10">
          {/* Présentation */}
          {hasPresentation && (
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-bold border-b pb-2" style={{ color: NAVY, borderColor: NAVY + "33" }}>
                Présentation
              </h2>
              {centre.description && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{centre.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {centre.mission && (
                  <div className="rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ backgroundColor: "#EEF2F9" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Mission</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{centre.mission}</p>
                  </div>
                )}
                {centre.vision && (
                  <div className="rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ backgroundColor: "#EEF2F9" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Vision</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{centre.vision}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Formations */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xl font-bold border-b pb-2" style={{ color: NAVY, borderColor: NAVY + "33" }}>
              Formations proposées
            </h2>

            {/* Méta centre-niveau */}
            {(centre.mode_formation || centre.public_cible) && (
              <div className="flex flex-wrap gap-2">
                {centre.mode_formation && (
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: NAVY, color: NAVY }}>
                    🖥️ {centre.mode_formation}
                  </span>
                )}
                {centre.public_cible && (
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: NAVY, color: NAVY }}>
                    👥 {centre.public_cible}
                  </span>
                )}
              </div>
            )}

            {formations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formations.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <p className="font-bold text-base leading-snug" style={{ color: NAVY }}>{f.nom}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.duree && (
                        <span className="rounded-full bg-[#EEF2F9] px-3 py-1 text-xs font-medium text-gray-600">
                          ⏱ {f.duree}
                        </span>
                      )}
                      {f.niveau && (
                        <span className="rounded-full bg-[#EEF2F9] px-3 py-1 text-xs font-medium text-gray-600">
                          📶 {f.niveau}
                        </span>
                      )}
                      {f.prix && (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold"
                          style={{ backgroundColor: GOLD + "22", color: NAVY }}
                        >
                          💰 {f.prix}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
                <p className="text-3xl mb-3">📚</p>
                <p className="text-sm font-medium">Aucune formation enregistrée pour l&apos;instant</p>
                <p className="text-xs mt-1">Revenez bientôt ou contactez le centre directement.</p>
              </div>
            )}
          </section>

          {/* Apprenants mis en avant */}
          {apprenants.length > 0 && (
            <section className="flex flex-col gap-5">
              <h2 className="text-xl font-bold border-b pb-2" style={{ color: NAVY, borderColor: NAVY + "33" }}>
                Apprenants mis en avant
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {apprenants.map((a) => {
                  const prenom = a.talents?.utilisateurs?.prenom ?? "";
                  const nom = a.talents?.utilisateurs?.nom ?? "";
                  const nomComplet = `${prenom} ${nom}`.trim() || "Apprenant";
                  const avatar = a.talents?.avatar_url;

                  return (
                    <div
                      key={a.id}
                      className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={nomComplet}
                            className="w-11 h-11 rounded-full object-cover shrink-0 border-2"
                            style={{ borderColor: NAVY + "33" }}
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: NAVY }}
                          >
                            {initFromNames(prenom, nom)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{nomComplet}</p>
                          {a.competence_acquise && (
                            <p className="text-xs truncate" style={{ color: GOLD }}>
                              {a.competence_acquise}
                            </p>
                          )}
                        </div>
                      </div>

                      {a.temoignage && (
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                          &ldquo;{a.temoignage}&rdquo;
                        </p>
                      )}

                      {a.talent_utilisateur_id && (
                        <Link
                          href={`/profil/${a.talent_utilisateur_id}`}
                          className="mt-auto inline-block text-center rounded-xl py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: NAVY }}
                        >
                          Voir le profil →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Contact en grand */}
          {(centre.whatsapp || centre.email) && (
            <section className="rounded-3xl p-8 sm:p-10 text-center" style={{ backgroundColor: NAVY }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Contacter {centre.nom_centre}
              </h2>
              <p className="text-white/70 text-sm mb-8">
                Posez vos questions, inscrivez-vous ou demandez plus d&apos;informations.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {centre.whatsapp && (
                  <a
                    href={`https://wa.me/${centre.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    📲 WhatsApp
                  </a>
                )}
                {centre.email && (
                  <a
                    href={`mailto:${centre.email}`}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    ✉️ Email
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white/60" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">
          TalentProof
        </Link>{" "}
        — la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
