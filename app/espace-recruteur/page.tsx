"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

/* ─── Statuts ─────────────────────────────────────────────────────────────── */

const STATUT_CANDIDATURE: Record<string, { label: string; cls: string }> = {
  recu:           { label: "Reçu",           cls: "bg-gray-100 text-gray-600" },
  consulte:       { label: "Consulté",        cls: "bg-blue-100 text-blue-700" },
  preselectionne: { label: "Présélectionné",  cls: "bg-purple-100 text-purple-700" },
  contacte:       { label: "Contacté",        cls: "bg-yellow-100 text-yellow-700" },
  retenu:         { label: "Retenu ✓",        cls: "bg-green-100 text-green-700" },
  refuse:         { label: "Refusé",          cls: "bg-red-100 text-red-600" },
};

const STATUT_OFFRE: Record<string, { label: string; cls: string }> = {
  ouverte:   { label: "Ouverte",   cls: "bg-green-100 text-green-700" },
  en_cours:  { label: "En cours",  cls: "bg-blue-100 text-blue-700" },
  fermee:    { label: "Fermée",    cls: "bg-gray-100 text-gray-500" },
};

const METIERS_RECHERCHE = [
  "Agent administratif", "Agent de nettoyage", "Agent de sécurité / Gardien",
  "Agent immobilier", "Agriculteur", "Aide-ménagère / Ménagère",
  "Architecte", "Artisan", "Assistant(e) comptable",
  "Assistant(e) de direction", "Carreleur", "Chauffeur",
  "Chauffeur-livreur", "Chef cuisinier", "Climaticien / Technicien HVAC",
  "Coiffeur / Coiffeuse", "Commercial / Vendeur", "Comptable",
  "Couturier / Tailleur", "Développeur web / mobile", "Électricien",
  "Enseignant / Formateur", "Esthéticien(ne)", "Gardien(ne) d'enfants",
  "Graphiste / Designer", "Infirmier / Infirmière", "Informaticien",
  "Ingénieur", "Journaliste / Rédacteur", "Juriste / Avocat",
  "Maçon", "Mécanicien", "Menuisier",
  "Peintre en bâtiment", "Photographe / Vidéaste", "Plombier",
  "Secrétaire", "Serveur / Serveuse", "Soudeur",
  "Technicien électronique", "Autre",
];

const NIVEAUX_RECHERCHE = [
  "Débutant (0–1 an)",
  "Junior (1–3 ans)",
  "Intermédiaire (3–5 ans)",
  "Senior (5–10 ans)",
  "Expert (10 ans+)",
];

const NEXT_STATUT: Record<string, string> = {
  recu:           "consulte",
  consulte:       "preselectionne",
  preselectionne: "contacte",
  contacte:       "retenu",
};

/* ─── Interfaces ──────────────────────────────────────────────────────────── */

interface Session {
  utilisateur_id: string;
  telephone: string;
}

interface Recruteur {
  utilisateur_id: string;
  prenom: string;
  nom: string;
  type_recruteur: string | null;
  secteur: string | null;
  ville: string | null;
  pays: string | null;
}

interface Offre {
  id: string;
  titre: string;
  statut: string;
  created_at: string;
  nb_candidatures?: number;
}

interface Candidature {
  id: string;
  offre_id: string | null;
  offre_titre: string | null;
  talent_utilisateur_id: string | null;
  statut: string;
  created_at: string;
  talent_prenom: string;
  talent_nom: string;
  talent_avatar: string | null;
  talent_metier: string | null;
}

/* ─── Composant formulaire de connexion ──────────────────────────────────── */

function ConnexionForm({ onSuccess }: { onSuccess: (s: Session) => void }) {
  const [telephone, setTelephone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("utilisateurs")
      .select("id")
      .eq("telephone", telephone.trim())
      .eq("pin", pin.trim())
      .eq("role", "recruteur")
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("Téléphone ou PIN incorrect.");
      return;
    }

    const session: Session = { utilisateur_id: data.id, telephone: telephone.trim() };
    localStorage.setItem("tp_recruteur", JSON.stringify(session));
    onSuccess(session);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#EEF2F9" }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8 flex flex-col gap-6">
        <div className="text-center">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" className="h-9 mx-auto mb-4" />
          </Link>
          <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>Espace Recruteur</h1>
          <p className="text-sm text-gray-500 mt-1">Connectez-vous pour accéder à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+224 6XX XXX XXX"
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#1B3A6B]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Code PIN (4 chiffres)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={4}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm tracking-widest focus:outline-none focus:border-[#1B3A6B]"
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: NAVY }}
          >
            {loading ? "Vérification…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Pas encore inscrit ?{" "}
          <Link href="/inscription?role=recruteur" className="font-semibold hover:underline" style={{ color: NAVY }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────────────────── */

export default function EspaceRecruteurPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [recruteur, setRecruteur] = useState<Recruteur | null>(null);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [searchMetier, setSearchMetier] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [searchNiveau, setSearchNiveau] = useState("");
  const [searchDispo, setSearchDispo] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchDashboard = useCallback(async (utilisateur_id: string) => {
    // Recruteur + utilisateurs join
    const { data: rData } = await supabase
      .from("recruteurs")
      .select(`
        utilisateur_id,
        type_recruteur,
        secteur,
        ville,
        pays,
        utilisateurs (
          prenom,
          nom
        )
      `)
      .eq("utilisateur_id", utilisateur_id)
      .single();

    if (rData) {
      const u = rData.utilisateurs as unknown as { prenom: string; nom: string } | null;
      setRecruteur({
        utilisateur_id: rData.utilisateur_id,
        prenom: u?.prenom ?? "",
        nom: u?.nom ?? "",
        type_recruteur: rData.type_recruteur,
        secteur: rData.secteur,
        ville: rData.ville,
        pays: rData.pays,
      });
    }

    // Offres d'emploi — table may not exist yet
    try {
      const { data: offresData, error } = await supabase
        .from("offres_emploi")
        .select("id, titre, statut, created_at")
        .eq("recruteur_utilisateur_id", utilisateur_id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && offresData) {
        // Compter candidatures par offre
        const offresWithCount = await Promise.all(
          (offresData as Offre[]).map(async (o) => {
            try {
              const { count } = await supabase
                .from("candidatures")
                .select("*", { count: "exact", head: true })
                .eq("offre_id", o.id);
              return { ...o, nb_candidatures: count ?? 0 };
            } catch {
              return { ...o, nb_candidatures: 0 };
            }
          })
        );
        setOffres(offresWithCount);
      }
    } catch { /* table n'existe pas encore */ }

    // Candidatures reçues
    try {
      const { data: candData, error } = await supabase
        .from("candidatures")
        .select(`
          id,
          offre_id,
          offre_titre,
          talent_utilisateur_id,
          statut,
          created_at,
          talents (
            metier_principal,
            avatar_url,
            utilisateurs (
              prenom,
              nom
            )
          )
        `)
        .eq("recruteur_utilisateur_id", utilisateur_id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && candData) {
        const mapped = (candData as unknown[]).map((c: unknown) => {
          const row = c as {
            id: string; offre_id: string | null; offre_titre: string | null;
            talent_utilisateur_id: string | null; statut: string; created_at: string;
            talents: { metier_principal: string | null; avatar_url: string | null;
              utilisateurs: { prenom: string; nom: string } | null } | null;
          };
          return {
            id: row.id,
            offre_id: row.offre_id,
            offre_titre: row.offre_titre,
            talent_utilisateur_id: row.talent_utilisateur_id,
            statut: row.statut,
            created_at: row.created_at,
            talent_prenom: row.talents?.utilisateurs?.prenom ?? "",
            talent_nom: row.talents?.utilisateurs?.nom ?? "",
            talent_avatar: row.talents?.avatar_url ?? null,
            talent_metier: row.talents?.metier_principal ?? null,
          };
        });
        setCandidatures(mapped);
      }
    } catch { /* table n'existe pas encore */ }

    setLoading(false);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("tp_recruteur");
    if (!raw) {
      setAuthChecked(true);
      setLoading(false);
      return;
    }
    try {
      const sess = JSON.parse(raw) as Session;
      if (!sess.utilisateur_id) throw new Error();
      setSession(sess);
      setAuthChecked(true);
      fetchDashboard(sess.utilisateur_id);
    } catch {
      localStorage.removeItem("tp_recruteur");
      setAuthChecked(true);
      setLoading(false);
    }
  }, [fetchDashboard]);

  function handleLoginSuccess(sess: Session) {
    setSession(sess);
    setLoading(true);
    fetchDashboard(sess.utilisateur_id);
  }

  function handleLogout() {
    localStorage.removeItem("tp_recruteur");
    setSession(null);
    setRecruteur(null);
    setOffres([]);
    setCandidatures([]);
  }

  async function updateStatutCandidature(id: string, newStatut: string) {
    try {
      await supabase.from("candidatures").update({ statut: newStatut }).eq("id", id);
      setCandidatures((prev) =>
        prev.map((c) => (c.id === id ? { ...c, statut: newStatut } : c))
      );
    } catch { /* silently ignore */ }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchMetier) params.set("metier", searchMetier);
    if (searchVille.trim()) params.set("ville", searchVille.trim());
    if (searchNiveau) params.set("niveau", searchNiveau);
    if (searchDispo) params.set("dispo", searchDispo);
    router.push(`/annuaire${params.toString() ? `?${params.toString()}` : ""}`);
  }

  // Pas encore vérifié l'auth
  if (!authChecked) return null;

  // Non connecté → formulaire
  if (!session) return <ConnexionForm onSuccess={handleLoginSuccess} />;

  // Chargement données
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ── En-tête ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold" style={{ color: NAVY }}>
              Bonjour {recruteur?.prenom || "Recruteur"} !
            </h1>
            {recruteur?.type_recruteur && (
              <p className="text-sm text-gray-500 mt-0.5">
                Recruteur{" "}
                <span className="font-semibold" style={{ color: GOLD }}>
                  {recruteur.type_recruteur === "independant" ? "indépendant" : recruteur.type_recruteur}
                </span>
                {recruteur.secteur && ` · ${recruteur.secteur}`}
              </p>
            )}
          </div>
          {(recruteur?.ville || recruteur?.pays) && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              📍 {[recruteur.ville, recruteur.pays].filter(Boolean).join(", ")}
            </p>
          )}
        </section>

        {/* ── Actions rapides ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold px-1" style={{ color: NAVY }}>Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "🔍", label: "Parcourir l'annuaire",         href: "/annuaire" },
              { icon: "✏️",  label: "Modifier mon profil recruteur", href: "/modifier-recruteur" },
              { icon: "📢", label: "Publier une offre d'emploi",    href: "/publier-offre" },
            ].map(({ icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-[#1B3A6B] transition-colors group"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1B3A6B] transition-colors leading-snug">
                  {label}
                </span>
                <span className="ml-auto text-gray-300 group-hover:text-[#1B3A6B] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recherche rapide ── */}
        <section className="bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold" style={{ color: NAVY }}>Recherche rapide de talents</h2>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Métier */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Métier</label>
                <select
                  value={searchMetier}
                  onChange={(e) => setSearchMetier(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1B3A6B]"
                >
                  <option value="">Tous les métiers</option>
                  {METIERS_RECHERCHE.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Ville */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Ville</label>
                <input
                  type="text"
                  value={searchVille}
                  onChange={(e) => setSearchVille(e.target.value)}
                  placeholder="ex: Conakry"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B]"
                />
              </div>

              {/* Niveau d'expérience */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Niveau d&apos;expérience</label>
                <select
                  value={searchNiveau}
                  onChange={(e) => setSearchNiveau(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1B3A6B]"
                >
                  <option value="">Tous les niveaux</option>
                  {NIVEAUX_RECHERCHE.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>

              {/* Disponibilité */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Disponibilité</label>
                <select
                  value={searchDispo}
                  onChange={(e) => setSearchDispo(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1B3A6B]"
                >
                  <option value="">Toutes</option>
                  <option value="immédiate">Immédiate</option>
                  <option value="1 mois">1 mois</option>
                  <option value="négociable">Négociable</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              🔍 Rechercher dans l&apos;annuaire
            </button>
          </form>
        </section>

        {/* ── Mes offres d'emploi ── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold" style={{ color: NAVY }}>Mes offres d&apos;emploi</h2>
            <Link
              href="/publier-offre"
              className="text-xs font-semibold rounded-full px-4 py-1.5 text-white"
              style={{ backgroundColor: GOLD }}
            >
              + Nouvelle offre
            </Link>
          </div>

          {offres.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-3">📢</p>
              <p className="text-sm font-medium">Vous n&apos;avez pas encore publié d&apos;offre</p>
              <p className="text-xs mt-1">Publiez votre première offre pour recevoir des candidatures.</p>
              <Link
                href="/publier-offre"
                className="inline-block mt-5 rounded-full px-6 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                Publier une offre
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {offres.map((o) => {
                const s = STATUT_OFFRE[o.statut] ?? { label: o.statut, cls: "bg-gray-100 text-gray-500" };
                return (
                  <div key={o.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{o.titre}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                        <span className="rounded-full bg-[#EEF2F9] px-2.5 py-0.5 text-xs font-semibold" style={{ color: NAVY }}>
                          {o.nb_candidatures ?? 0} candidature{(o.nb_candidatures ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    {(o.nb_candidatures ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          const el = document.getElementById("candidatures-section");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-3 text-xs font-semibold hover:underline"
                        style={{ color: NAVY }}
                      >
                        Voir les candidatures →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Candidatures reçues ── */}
        <section id="candidatures-section" className="flex flex-col gap-3">
          <h2 className="text-base font-bold px-1" style={{ color: NAVY }}>Candidatures reçues</h2>

          {candidatures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-3">📬</p>
              <p className="text-sm font-medium">Aucune candidature reçue pour l&apos;instant</p>
              <p className="text-xs mt-1">Les candidatures apparaîtront ici dès que des talents postuleront.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {candidatures.map((c) => {
                const statStyle = STATUT_CANDIDATURE[c.statut] ?? { label: c.statut, cls: "bg-gray-100 text-gray-600" };
                const nextStatut = NEXT_STATUT[c.statut];

                return (
                  <div key={c.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                    {/* Talent + offre */}
                    <div className="flex items-center gap-3">
                      {c.talent_avatar ? (
                        <img
                          src={c.talent_avatar}
                          alt={`${c.talent_prenom} ${c.talent_nom}`}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border-2"
                          style={{ borderColor: NAVY + "33" }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: NAVY }}
                        >
                          {`${c.talent_prenom?.[0] ?? ""}${c.talent_nom?.[0] ?? ""}`.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {`${c.talent_prenom} ${c.talent_nom}`.trim() || "Talent"}
                        </p>
                        {c.talent_metier && (
                          <p className="text-xs text-gray-500 truncate">{c.talent_metier}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statStyle.cls}`}>
                        {statStyle.label}
                      </span>
                    </div>

                    {c.offre_titre && (
                      <p className="text-xs text-gray-400">
                        Offre : <span className="font-medium text-gray-600">{c.offre_titre}</span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {c.talent_utilisateur_id && (
                        <Link
                          href={`/profil/${c.talent_utilisateur_id}`}
                          target="_blank"
                          className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#1B3A6B] hover:text-white"
                          style={{ borderColor: NAVY, color: NAVY }}
                        >
                          Voir le profil →
                        </Link>
                      )}
                      {nextStatut && (
                        <button
                          onClick={() => updateStatutCandidature(c.id, nextStatut)}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: NAVY }}
                        >
                          Marquer : {STATUT_CANDIDATURE[nextStatut]?.label}
                        </button>
                      )}
                      {c.statut === "contacte" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatutCandidature(c.id, "retenu")}
                            className="rounded-full bg-green-100 text-green-700 px-3 py-1.5 text-xs font-semibold hover:bg-green-200 transition-colors"
                          >
                            ✓ Retenir
                          </button>
                          <button
                            onClick={() => updateStatutCandidature(c.id, "refuse")}
                            className="rounded-full bg-red-100 text-red-600 px-3 py-1.5 text-xs font-semibold hover:bg-red-200 transition-colors"
                          >
                            ✗ Refuser
                          </button>
                        </div>
                      )}
                    </div>
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
