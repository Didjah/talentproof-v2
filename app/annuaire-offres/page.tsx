"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD  = "#C9A84C";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Offre {
  id: string;
  titre: string;
  description: string | null;
  localisation: string | null;
  type_contrat: string | null;
  salaire: string | null;
  diplome_requis: string | null;
  experience_requise: string | null;
  statut: string | null;
  created_at: string;
  recruteur_utilisateur_id: string | null;
  entreprise_utilisateur_id: string | null;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const TYPES_CONTRAT = ["CDI", "CDD", "Freelance", "Stage", "Alternance", "Temps partiel"];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function normalise(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function ageEnJours(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function dateRelative(dateStr: string): string {
  const jours = ageEnJours(dateStr);
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Il y a 1 jour";
  if (jours < 30) return `Il y a ${jours} jours`;
  const mois = Math.floor(jours / 30);
  return `Il y a ${mois} mois`;
}

function estSansDiplome(diplome: string | null): boolean {
  if (!diplome) return true;
  const d = diplome.trim().toLowerCase();
  return d === "" || d === "aucun" || d === "none";
}

function estTeletravail(localisation: string | null): boolean {
  if (!localisation) return false;
  const l = normalise(localisation);
  return l.includes("teletravail") || l.includes("remote");
}

// ─── Chip type contrat ────────────────────────────────────────────────────────

const CONTRAT_COLORS: Record<string, string> = {
  CDI: "bg-blue-100 text-blue-700",
  CDD: "bg-purple-100 text-purple-700",
  Freelance: "bg-orange-100 text-orange-700",
  Stage: "bg-teal-100 text-teal-700",
  Alternance: "bg-indigo-100 text-indigo-700",
  "Temps partiel": "bg-gray-100 text-gray-600",
};

function ContratChip({ type }: { type: string }) {
  const cls = CONTRAT_COLORS[type] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {type}
    </span>
  );
}

// ─── Carte offre ──────────────────────────────────────────────────────────────

function OffreCard({ o }: { o: Offre }) {
  const urgent = ageEnJours(o.created_at) < 3;
  const sansDiplome = estSansDiplome(o.diplome_requis);

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-3 w-full" style={{ backgroundColor: NAVY }} />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Titre */}
        <h3 className="font-bold text-base leading-snug" style={{ color: NAVY }}>
          {o.titre}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {urgent && (
            <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-3 py-1">
              🚨 Urgent
            </span>
          )}
          {sansDiplome && (
            <span className="rounded-full bg-green-100 text-green-700 text-xs font-bold px-3 py-1">
              🎓 Sans diplôme
            </span>
          )}
          {o.type_contrat && <ContratChip type={o.type_contrat} />}
        </div>

        {/* Localisation */}
        {o.localisation && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>📍</span> {o.localisation}
          </p>
        )}

        {/* Salaire */}
        {o.salaire && (
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Salaire :</span>{" "}
            {o.salaire}
          </p>
        )}

        {/* Description */}
        {o.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {o.description}
          </p>
        )}

        {/* Date */}
        <p className="text-xs text-gray-400 mt-auto pt-1">
          🕐 {dateRelative(o.created_at)}
        </p>
      </div>

      {/* Bouton */}
      <div className="px-5 pb-5">
        <Link
          href={`/offre/${o.id}`}
          className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          Voir l&apos;offre
        </Link>
      </div>
    </div>
  );
}

// ─── Panneau de filtres ───────────────────────────────────────────────────────

const selectCls =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition";

interface Filters {
  texte: string;
  typeContrat: string;
}

const FILTERS_INIT: Filters = { texte: "", typeContrat: "" };

interface FilterPanelProps {
  filters: Filters;
  onChange: (key: keyof Filters, val: string) => void;
  onReset: () => void;
  count: number;
  total: number;
  urgentOnly: boolean;
  onToggleUrgent: (v: boolean) => void;
  sansDiplomeOnly: boolean;
  onToggleSansDiplome: (v: boolean) => void;
  teletravailOnly: boolean;
  onToggleTeletravail: (v: boolean) => void;
  triPar: string;
  onTriPar: (v: string) => void;
}

function FilterPanel({
  filters, onChange, onReset, count, total,
  urgentOnly, onToggleUrgent,
  sansDiplomeOnly, onToggleSansDiplome,
  teletravailOnly, onToggleTeletravail,
  triPar, onTriPar,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">
          {count} / {total} offre{total !== 1 ? "s" : ""}
        </span>
        <button onClick={onReset} className="text-xs font-semibold hover:underline" style={{ color: NAVY }}>
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
          placeholder="Titre, localisation, description…"
          className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition"
        />
      </div>

      {/* Type de contrat */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Type de contrat</label>
        <select
          className={selectCls}
          value={filters.typeContrat}
          onChange={(e) => onChange("typeContrat", e.target.value)}
        >
          <option value="">Tous les contrats</option>
          {TYPES_CONTRAT.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Checkboxes */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none mt-1">
        <input
          type="checkbox"
          checked={urgentOnly}
          onChange={(e) => onToggleUrgent(e.target.checked)}
          className="w-4 h-4 rounded accent-[#C9A84C]"
        />
        <span className="text-sm font-semibold" style={{ color: NAVY }}>
          🚨 Urgent (moins de 3 jours)
        </span>
      </label>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={sansDiplomeOnly}
          onChange={(e) => onToggleSansDiplome(e.target.checked)}
          className="w-4 h-4 rounded accent-[#C9A84C]"
        />
        <span className="text-sm font-semibold" style={{ color: NAVY }}>
          🎓 Sans diplôme requis
        </span>
      </label>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={teletravailOnly}
          onChange={(e) => onToggleTeletravail(e.target.checked)}
          className="w-4 h-4 rounded accent-[#C9A84C]"
        />
        <span className="text-sm font-semibold" style={{ color: NAVY }}>
          💻 Télétravail possible
        </span>
      </label>

      {/* Trier par */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Trier par</label>
        <select className={selectCls} value={triPar} onChange={(e) => onTriPar(e.target.value)}>
          <option value="recentes">Plus récentes en premier</option>
          <option value="anciennes">Plus anciennes en premier</option>
        </select>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AnnuaireOffresPage() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(FILTERS_INIT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [sansDiplomeOnly, setSansDiplomeOnly] = useState(false);
  const [teletravailOnly, setTeletravailOnly] = useState(false);
  const [triPar, setTriPar] = useState("recentes");

  useEffect(() => {
    async function fetchData() {
      const { data, error: err } = await supabase
        .from("offres_emploi")
        .select(
          "id, titre, description, localisation, type_contrat, salaire, diplome_requis, experience_requise, statut, created_at, recruteur_utilisateur_id, entreprise_utilisateur_id"
        )
        .eq("statut", "ouverte")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setOffres((data ?? []) as Offre[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  function setFilter(key: keyof Filters, val: string) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  function resetAll() {
    setFilters(FILTERS_INIT);
    setUrgentOnly(false);
    setSansDiplomeOnly(false);
    setTeletravailOnly(false);
    setTriPar("recentes");
  }

  const filtered = useMemo(() => {
    let result = offres.filter((o) => {
      if (filters.texte) {
        const q = normalise(filters.texte);
        const haystack = normalise(
          [o.titre, o.description, o.localisation].filter(Boolean).join(" ")
        );
        if (!haystack.includes(q)) return false;
      }
      if (filters.typeContrat && o.type_contrat !== filters.typeContrat) return false;
      if (urgentOnly && ageEnJours(o.created_at) >= 3) return false;
      if (sansDiplomeOnly && !estSansDiplome(o.diplome_requis)) return false;
      if (teletravailOnly && !estTeletravail(o.localisation)) return false;
      return true;
    });

    if (triPar === "anciennes") {
      result = [...result].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    // "recentes" : déjà trié par created_at desc depuis Supabase

    return result;
  }, [offres, filters, urgentOnly, sansDiplomeOnly, teletravailOnly, triPar]);

  const hasActiveFilter =
    Object.values(filters).some(Boolean) ||
    urgentOnly ||
    sansDiplomeOnly ||
    teletravailOnly ||
    triPar !== "recentes";

  const filterPanelProps: FilterPanelProps = {
    filters,
    onChange: setFilter,
    onReset: resetAll,
    count: filtered.length,
    total: offres.length,
    urgentOnly,
    onToggleUrgent: setUrgentOnly,
    sansDiplomeOnly,
    onToggleSansDiplome: setSansDiplomeOnly,
    teletravailOnly,
    onToggleTeletravail: setTeletravailOnly,
    triPar,
    onTriPar: setTriPar,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Talents</Link>
            <Link href="/annuaire-entreprises" className="hover:text-[#1B3A6B] transition-colors">Entreprises</Link>
            <Link href="/annuaire-centres" className="hover:text-[#1B3A6B] transition-colors">Centres</Link>
            <Link
              href="/annuaire-offres"
              className="font-bold border-b-2 pb-0.5"
              style={{ color: NAVY, borderColor: NAVY }}
            >
              Offres
            </Link>
          </nav>
          <Link
            href="/inscription?role=talent"
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: GOLD }}
          >
            Créer mon profil
          </Link>
        </div>
      </header>

      {/* Titre */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: NAVY }}>
            Offres d&apos;emploi
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Trouvez un emploi qui valorise vos compétences réelles
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6">

          {/* Sidebar filtres desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Filtrer</h2>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Contenu principal */}
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
                    <span className="rounded-full text-white text-xs px-2 py-0.5" style={{ backgroundColor: NAVY }}>
                      {[
                        ...Object.values(filters).filter(Boolean),
                        urgentOnly ? "u" : null,
                        sansDiplomeOnly ? "d" : null,
                        teletravailOnly ? "t" : null,
                        triPar !== "recentes" ? triPar : null,
                      ].filter(Boolean).length}
                    </span>
                  )}
                </span>
                <span className="text-gray-400">{filtersOpen ? "▲" : "▼"}</span>
              </button>
              {filtersOpen && (
                <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <FilterPanel {...filterPanelProps} />
                </div>
              )}
            </div>

            {/* Résultats */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-gray-100 h-56 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-8 text-center">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-16 text-center">
                <p className="text-4xl mb-3">💼</p>
                <p className="text-gray-600 font-semibold mb-1">Aucune offre trouvée</p>
                <p className="text-sm text-gray-400 mb-4">Essayez d&apos;élargir vos critères</p>
                {hasActiveFilter && (
                  <button
                    onClick={resetAll}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: NAVY }}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4 lg:hidden">
                  {filtered.length} offre{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((o) => (
                    <OffreCard key={o.id} o={o} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-8 py-6 text-center text-sm text-white" style={{ backgroundColor: NAVY }}>
        TalentProof — la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
