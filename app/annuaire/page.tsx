"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/src/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Talent {
  id: string;
  utilisateur_id: string;
  metier_principal: string;
  niveau_experience: string;
  disponibilite: string;
  competences_principales: string;
  avatar_url: string | null;
  video_url: string | null;
  preuve_url: string | null;
  has_video: boolean | null;
  has_photo: boolean | null;
  utilisateurs: {
    prenom: string;
    nom: string;
    pays: string;
    ville: string;
  } | null;
}

// ─── Données statiques ─────────────────────────────────────────────────────────

const METIERS = [
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

const PAYS = [
  "Guinée", "Sénégal", "Mali", "Côte d'Ivoire", "Burkina Faso",
  "Cameroun", "Togo", "Bénin", "Niger", "Mauritanie",
  "France", "Belgique", "Canada", "Maroc", "Autre",
];

const NIVEAUX = [
  "Débutant (0–1 an)",
  "Junior (1–3 ans)",
  "Intermédiaire (3–5 ans)",
  "Senior (5–10 ans)",
  "Expert (10 ans+)",
];

const DISPO_CONFIG: Record<string, { label: string; cls: string }> = {
  "immédiate":   { label: "Dispo. immédiate", cls: "bg-green-100 text-green-700" },
  "1 mois":      { label: "Dispo. 1 mois",    cls: "bg-orange-100 text-orange-700" },
  "négociable":  { label: "Négociable",        cls: "bg-gray-100 text-gray-600" },
};

// ─── Utilitaires ───────────────────────────────────────────────────────────────

function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

function splitCompetences(raw: string): string[] {
  return raw
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function normalise(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ─── Composant carte talent ─────────────────────────────────────────────────────

function TalentCard({ talent }: { talent: Talent }) {
  const prenom = talent.utilisateurs?.prenom ?? "";
  const nom = talent.utilisateurs?.nom ?? "";
  const nomComplet = `${prenom} ${nom}`.trim() || "Talent";
  const competences = splitCompetences(talent.competences_principales ?? "");
  const dispo = DISPO_CONFIG[talent.disponibilite] ?? DISPO_CONFIG["négociable"];
  const hasVideo = talent.has_video ?? Boolean(talent.video_url);
  const hasPhoto = talent.has_photo ?? Boolean(talent.preuve_url);

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* En-tête colorée */}
      <div className="h-3 w-full" style={{ backgroundColor: "#1a5c3a" }} />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Avatar + Identité */}
        <div className="flex items-center gap-3">
          {talent.avatar_url ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-[#1a5c3a]/20">
              <Image src={talent.avatar_url} alt={nomComplet} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: "#1a5c3a" }}>
              {initiales(prenom, nom)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{nomComplet}</p>
            <p className="text-sm font-medium truncate" style={{ color: "#1a5c3a" }}>
              {talent.metier_principal || "—"}
            </p>
          </div>
        </div>

        {/* Localisation */}
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span>📍</span>
          {[talent.utilisateurs?.ville, talent.utilisateurs?.pays].filter(Boolean).join(", ") || "Localisation non renseignée"}
        </p>

        {/* Niveau d'expérience */}
        {talent.niveau_experience && (
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Niveau :</span>{" "}
            {talent.niveau_experience}
          </p>
        )}

        {/* Badges médias */}
        {(hasVideo || hasPhoto) && (
          <div className="flex gap-2 flex-wrap">
            {hasVideo && (
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 rounded-full px-2.5 py-1">
                ✓ Vidéo
              </span>
            )}
            {hasPhoto && (
              <span className="text-xs font-semibold bg-purple-50 text-purple-600 rounded-full px-2.5 py-1">
                📷 Photo
              </span>
            )}
          </div>
        )}

        {/* Badge disponibilité */}
        <span className={`self-start text-xs font-semibold rounded-full px-2.5 py-1 ${dispo.cls}`}>
          {dispo.label}
        </span>

        {/* Compétences */}
        {competences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {competences.map((c) => (
              <span key={c} className="text-xs bg-[#f0f7f3] text-[#1a5c3a] rounded-lg px-2 py-1 font-medium">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bouton */}
      <div className="px-5 pb-5">
        <Link
          href={`/profil/${talent.utilisateur_id}`}
          className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1a5c3a" }}
        >
          Voir le profil
        </Link>
      </div>
    </div>
  );
}

// ─── Composants filtres ─────────────────────────────────────────────────────────

const selectCls = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1a5c3a] focus:ring-2 focus:ring-[#1a5c3a]/20 transition";

function FilterPanel({
  filters,
  onChange,
  onReset,
  count,
  total,
}: {
  filters: Filters;
  onChange: (key: keyof Filters, val: string) => void;
  onReset: () => void;
  count: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{count} / {total} profil{total !== 1 ? "s" : ""}</span>
        <button onClick={onReset} className="text-xs text-[#1a5c3a] font-semibold hover:underline">
          Réinitialiser
        </button>
      </div>

      {/* Recherche texte */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          value={filters.texte}
          onChange={(e) => onChange("texte", e.target.value)}
          placeholder="Nom, métier, compétences…"
          className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#1a5c3a] focus:ring-2 focus:ring-[#1a5c3a]/20 transition"
        />
      </div>

      {/* Métier */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Métier</label>
        <select className={selectCls} value={filters.metier} onChange={(e) => onChange("metier", e.target.value)}>
          <option value="">Tous les métiers</option>
          {METIERS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Pays */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Pays</label>
        <select className={selectCls} value={filters.pays} onChange={(e) => onChange("pays", e.target.value)}>
          <option value="">Tous les pays</option>
          {PAYS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Ville */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Ville</label>
        <input
          type="text"
          value={filters.ville}
          onChange={(e) => onChange("ville", e.target.value)}
          placeholder="ex: Conakry"
          className={selectCls}
        />
      </div>

      {/* Disponibilité */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Disponibilité</label>
        <select className={selectCls} value={filters.disponibilite} onChange={(e) => onChange("disponibilite", e.target.value)}>
          <option value="">Toutes</option>
          <option value="immédiate">Immédiate</option>
          <option value="1 mois">1 mois</option>
          <option value="négociable">Négociable</option>
        </select>
      </div>

      {/* Niveau d'expérience */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Niveau d'expérience</label>
        <select className={selectCls} value={filters.niveau} onChange={(e) => onChange("niveau", e.target.value)}>
          <option value="">Tous les niveaux</option>
          {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

interface Filters {
  texte: string;
  metier: string;
  pays: string;
  ville: string;
  disponibilite: string;
  niveau: string;
}

const FILTERS_INIT: Filters = {
  texte: "", metier: "", pays: "", ville: "", disponibilite: "", niveau: "",
};

export default function AnnuairePage() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(FILTERS_INIT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchTalents() {
      const { data, error } = await supabase
        .from("talents")
        .select(`
          id,
          utilisateur_id,
          metier_principal,
          niveau_experience,
          disponibilite,
          competences_principales,
          avatar_url,
          video_url,
          preuve_url,
          has_video,
          has_photo,
          utilisateurs (
            prenom,
            nom,
            pays,
            ville
          )
        `)
        .eq("profil_public", true)
        .order("id", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTalents((data ?? []) as unknown as Talent[]);
      }
      setLoading(false);
    }
    fetchTalents();
  }, []);

  function setFilter(key: keyof Filters, val: string) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  const filtered = useMemo(() => {
    return talents.filter((t) => {
      const prenom = t.utilisateurs?.prenom ?? "";
      const nom = t.utilisateurs?.nom ?? "";
      const nomComplet = normalise(`${prenom} ${nom}`);
      const metier = normalise(t.metier_principal ?? "");
      const competences = normalise(t.competences_principales ?? "");

      if (filters.texte) {
        const q = normalise(filters.texte);
        if (!nomComplet.includes(q) && !metier.includes(q) && !competences.includes(q)) return false;
      }
      if (filters.metier && t.metier_principal !== filters.metier) return false;
      if (filters.pays && t.utilisateurs?.pays !== filters.pays) return false;
      if (filters.ville && !normalise(t.utilisateurs?.ville ?? "").includes(normalise(filters.ville))) return false;
      if (filters.disponibilite && t.disponibilite !== filters.disponibilite) return false;
      if (filters.niveau && t.niveau_experience !== filters.niveau) return false;
      return true;
    });
  }, [talents, filters]);

  const hasActiveFilter = Object.values(filters).some(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tight shrink-0" style={{ color: "#1a5c3a" }}>
            TalentProof
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="text-[#1a5c3a] font-bold border-b-2 border-[#1a5c3a] pb-0.5">Annuaire</Link>
            <Link href="/recruteur" className="hover:text-[#1a5c3a] transition-colors">Espace Recruteur</Link>
          </nav>
          <Link href="/inscription?role=talent"
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#1a5c3a" }}>
            Créer mon profil
          </Link>
        </div>
      </header>

      {/* Titre */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#1a5c3a" }}>
            Annuaire des talents
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Trouvez le profil qu'il vous faut parmi nos talents vérifiés
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6">

          {/* ─── Sidebar filtres (desktop) ─── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Filtrer</h2>
              <FilterPanel
                filters={filters}
                onChange={setFilter}
                onReset={() => setFilters(FILTERS_INIT)}
                count={filtered.length}
                total={talents.length}
              />
            </div>
          </aside>

          {/* ─── Contenu principal ─── */}
          <div className="flex-1 min-w-0">

            {/* Filtres mobile */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <span>🔽</span> Filtrer les résultats
                  {hasActiveFilter && (
                    <span className="rounded-full bg-[#1a5c3a] text-white text-xs px-2 py-0.5">
                      {Object.values(filters).filter(Boolean).length}
                    </span>
                  )}
                </span>
                <span className="text-gray-400">{filtersOpen ? "▲" : "▼"}</span>
              </button>
              {filtersOpen && (
                <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <FilterPanel
                    filters={filters}
                    onChange={setFilter}
                    onReset={() => setFilters(FILTERS_INIT)}
                    count={filtered.length}
                    total={talents.length}
                  />
                </div>
              )}
            </div>

            {/* Résultats */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-gray-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-8 text-center">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-16 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-600 font-semibold mb-1">Aucun talent trouvé</p>
                <p className="text-sm text-gray-400 mb-4">Essayez d'élargir vos critères de recherche</p>
                {hasActiveFilter && (
                  <button onClick={() => setFilters(FILTERS_INIT)}
                    className="text-sm font-semibold text-[#1a5c3a] hover:underline">
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4 lg:hidden">
                  {filtered.length} profil{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((t) => (
                    <TalentCard key={t.id} talent={t} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-8 py-6 text-center text-sm text-white" style={{ backgroundColor: "#1a5c3a" }}>
        TalentProof — la preuve que la compétence mérite d'être vue.
      </footer>
    </div>
  );
}
