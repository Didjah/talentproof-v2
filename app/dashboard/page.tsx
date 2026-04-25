"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const STATUT_STYLE: Record<string, { label: string; cls: string }> = {
  recu:          { label: "Reçu",          cls: "bg-gray-100 text-gray-600" },
  consulte:      { label: "Consulté",      cls: "bg-blue-100 text-blue-700" },
  preselectionne:{ label: "Présélectionné",cls: "bg-purple-100 text-purple-700" },
  contacte:      { label: "Contacté",      cls: "bg-yellow-100 text-yellow-700" },
  retenu:        { label: "Retenu ✓",      cls: "bg-green-100 text-green-700" },
  refuse:        { label: "Refusé",        cls: "bg-red-100 text-red-600" },
};

interface Session {
  utilisateur_id: string;
  telephone: string;
}

interface Profil {
  utilisateur_id: string;
  prenom: string;
  nom: string;
  avatar_url: string | null;
  video_presentation_url: string | null;
  bio: string | null;
  competences_principales: string | null;
  cv_url: string | null;
  diplome_url: string | null;
  preuve_url: string | null;
  whatsapp: string | null;
  metier_principal: string | null;
  niveau_experience: string | null;
}

interface Candidature {
  id: string;
  offre_titre: string | null;
  entreprise_nom: string | null;
  statut: string;
  created_at: string;
}

function computeScore(p: Profil): number {
  let score = 0;
  if (p.avatar_url)                                    score += 15;
  if (p.video_presentation_url)                        score += 20;
  if (p.bio?.trim())                                   score += 10;
  if (p.competences_principales?.trim())               score += 10;
  if (p.cv_url || p.diplome_url)                       score += 15;
  if (p.preuve_url)                                    score += 15;
  if (p.whatsapp?.trim())                              score += 5;
  if (p.metier_principal?.trim() && p.niveau_experience?.trim()) score += 10;
  return score;
}

function scoreMeta(score: number) {
  if (score <= 40) return { color: "#EF4444", badge: "🥉 Bronze" };
  if (score <= 70) return { color: "#F97316", badge: "🥈 Argent" };
  return { color: "#22C55E", badge: "🥇 Or" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [vues, setVues] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("tp_talent");
    if (!raw) {
      router.replace("/connexion");
      return;
    }

    let sess: Session;
    try {
      sess = JSON.parse(raw) as Session;
    } catch {
      router.replace("/connexion");
      return;
    }

    if (!sess.utilisateur_id) {
      router.replace("/connexion");
      return;
    }

    setSession(sess);

    async function fetchData(utilisateur_id: string) {
      // Fetch talent + utilisateurs join
      const { data: talentData } = await supabase
        .from("talents")
        .select(`
          utilisateur_id,
          avatar_url,
          video_presentation_url,
          bio,
          competences_principales,
          cv_url,
          diplome_url,
          preuve_url,
          whatsapp,
          metier_principal,
          niveau_experience,
          utilisateurs (
            prenom,
            nom
          )
        `)
        .eq("utilisateur_id", utilisateur_id)
        .single();

      if (talentData) {
        const u = talentData.utilisateurs as unknown as { prenom: string; nom: string } | null;
        setProfil({
          utilisateur_id: talentData.utilisateur_id,
          prenom: u?.prenom ?? "",
          nom: u?.nom ?? "",
          avatar_url: talentData.avatar_url,
          video_presentation_url: talentData.video_presentation_url,
          bio: talentData.bio,
          competences_principales: talentData.competences_principales,
          cv_url: talentData.cv_url,
          diplome_url: talentData.diplome_url,
          preuve_url: talentData.preuve_url,
          whatsapp: talentData.whatsapp,
          metier_principal: talentData.metier_principal,
          niveau_experience: talentData.niveau_experience,
        });
      }

      // Candidatures — table may not exist yet
      try {
        const { data: candData, error } = await supabase
          .from("candidatures")
          .select("id, offre_titre, entreprise_nom, statut, created_at")
          .eq("talent_utilisateur_id", utilisateur_id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && candData) setCandidatures(candData as Candidature[]);
      } catch { /* table doesn't exist yet */ }

      // Vues profil — table may not exist yet
      try {
        const { count, error } = await supabase
          .from("vues_profil")
          .select("*", { count: "exact", head: true })
          .eq("talent_utilisateur_id", utilisateur_id);

        if (!error && count !== null) setVues(count);
      } catch { /* table doesn't exist yet */ }

      setLoading(false);
    }

    fetchData(sess.utilisateur_id);
  }, [router]);

  if (loading || !profil) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const score = computeScore(profil);
  const { color: scoreColor, badge } = scoreMeta(score);

  const quickActions = [
    { condition: !profil.avatar_url,                    icon: "📸", label: "Ajouter une photo",         href: "/modifier-profil#photo" },
    { condition: !profil.video_presentation_url,         icon: "🎬", label: "Ajouter une vidéo",         href: "/modifier-profil#video" },
    { condition: !profil.bio?.trim(),                    icon: "✍️",  label: "Compléter ma bio",          href: "/modifier-profil#bio" },
    { condition: !profil.competences_principales?.trim(),icon: "🔧", label: "Ajouter mes compétences",   href: "/modifier-profil#competences" },
  ].filter((a) => a.condition);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
          </Link>
          <button
            onClick={() => { localStorage.removeItem("tp_talent"); router.push("/connexion"); }}
            className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ── En-tête dashboard ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
          {/* Avatar + bonjour */}
          <div className="flex items-center gap-4">
            {profil.avatar_url ? (
              <img
                src={profil.avatar_url}
                alt={profil.prenom}
                className="w-16 h-16 rounded-full object-cover shrink-0 border-2"
                style={{ borderColor: NAVY }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: NAVY }}
              >
                {`${profil.prenom?.[0] ?? ""}${profil.nom?.[0] ?? ""}`.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="text-lg sm:text-xl font-extrabold" style={{ color: NAVY }}>
                Bonjour {profil.prenom} !
              </p>
              <p className="text-sm text-gray-500">Voici l&apos;état de votre profil TalentProof.</p>
            </div>
          </div>

          {/* Score + barre */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Score de profil</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}/100</span>
                <span className="text-sm">{badge}</span>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, backgroundColor: scoreColor }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {score <= 40 && "Complétez votre profil pour augmenter vos chances d'être recruté."}
              {score > 40 && score <= 70 && "Bon début ! Ajoutez plus d'éléments pour atteindre le niveau Or."}
              {score > 70 && "Excellent profil ! Vous êtes bien visible par les recruteurs."}
            </p>
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/profil/${profil.utilisateur_id}`}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              👁 Voir mon profil public
            </Link>
            <Link
              href="/modifier-profil"
              className="inline-flex items-center gap-1.5 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#1B3A6B] hover:text-white"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              ✏️ Modifier mon profil
            </Link>
          </div>
        </section>

        {/* ── Actions rapides ── */}
        {quickActions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold px-1" style={{ color: NAVY }}>
              Actions rapides pour améliorer votre score
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map(({ icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-[#1B3A6B] transition-colors group"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1B3A6B] transition-colors">{label}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-[#1B3A6B] transition-colors">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Statistiques ── */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl px-5 py-5 shadow-sm flex flex-col gap-1 border border-gray-100">
            <span className="text-3xl font-extrabold" style={{ color: GOLD }}>
              {vues !== null ? vues : "—"}
            </span>
            <span className="text-xs text-gray-500 font-medium">Vues du profil</span>
          </div>
          <div className="bg-white rounded-2xl px-5 py-5 shadow-sm flex flex-col gap-1 border border-gray-100">
            <span className="text-3xl font-extrabold" style={{ color: GOLD }}>
              {candidatures.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">Candidatures envoyées</span>
          </div>
        </section>

        {/* ── Candidatures ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold px-1" style={{ color: NAVY }}>
            Mes candidatures
          </h2>

          {candidatures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-medium">Vous n&apos;avez pas encore postulé à des offres</p>
              <p className="text-xs mt-1">Consultez l&apos;annuaire pour trouver des opportunités.</p>
              <Link
                href="/annuaire"
                className="inline-block mt-5 rounded-full px-6 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                Voir l&apos;annuaire
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {candidatures.map((c) => {
                const s = STATUT_STYLE[c.statut] ?? { label: c.statut, cls: "bg-gray-100 text-gray-600" };
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {c.offre_titre ?? "Offre sans titre"}
                      </p>
                      {c.entreprise_nom && (
                        <p className="text-xs text-gray-500 truncate">{c.entreprise_nom}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.created_at)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white/60 mt-4" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
