"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD  = "#C9A84C";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Entreprise {
  id: string;
  utilisateur_id: string;
  nom_entreprise: string;
  logo_url: string | null;
  secteur: string | null;
  taille: string | null;
  description: string | null;
  whatsapp: string | null;
  verifie: boolean | null;
  ville: string | null;
  pays: string | null;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const SECTEURS = [
  "BTP", "Santé", "Tech / Informatique", "Transport / Logistique",
  "Agriculture", "Commerce / Vente", "Restauration / Hôtellerie",
  "Finance / Banque", "Éducation / Formation", "Autre",
];

const PAYS = [
  "Guinée", "Sénégal", "Mali", "Côte d'Ivoire", "Burkina Faso",
  "Cameroun", "Togo", "Bénin", "Niger", "Mauritanie",
  "France", "Belgique", "Canada", "Maroc", "Autre",
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function initiales(nom: string) {
  return nom.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function normalise(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ─── Carte entreprise ─────────────────────────────────────────────────────────

function EntrepriseCard({
  e,
  recrute,
}: {
  e: Entreprise;
  recrute: boolean;
}) {
  const lieu = [e.ville, e.pays].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-3 w-full" style={{ backgroundColor: NAVY }} />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Logo + identité */}
        <div className="flex items-center gap-3">
          {e.logo_url ? (
            <img
              src={e.logo_url}
              alt={e.nom_entreprise}
              className="w-14 h-14 rounded-xl object-contain border border-gray-200 shrink-0 bg-white"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: NAVY }}
            >
              {initiales(e.nom_entreprise)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-gray-900 truncate">{e.nom_entreprise}</p>
              {e.verifie && (
                <span
                  className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  ✓ Vérifié
                </span>
              )}
            </div>
            {e.secteur && (
              <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
                {e.secteur}
              </p>
            )}
          </div>
        </div>

        {/* Badge recrute */}
        {recrute && (
          <span className="self-start rounded-full bg-green-100 text-green-700 text-xs font-bold px-3 py-1">
            🔥 Recrute activement
          </span>
        )}

        {/* Localisation */}
        {lieu && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>📍</span> {lieu}
          </p>
        )}

        {/* Taille */}
        {e.taille && (
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Taille :</span>{" "}
            {e.taille}
          </p>
        )}

        {/* Description */}
        {e.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {e.description}
          </p>
        )}
      </div>

      {/* Bouton */}
      <div className="px-5 pb-5">
        <Link
          href={`/entreprise/${e.id}`}
          className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          Voir la vitrine
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
  secteur: string;
  pays: string;
}

const FILTERS_INIT: Filters = { texte: "", secteur: "", pays: "" };

function FilterPanel({
  filters,
  onChange,
  onReset,
  count,
  total,
  verifieOnly,
  onToggleVerifie,
  recruteOnly,
  onToggleRecrute,
  triPar,
  onTriPar,
}: {
  filters: Filters;
  onChange: (key: keyof Filters, val: string) => void;
  onReset: () => void;
  count: number;
  total: number;
  verifieOnly: boolean;
  onToggleVerifie: (v: boolean) => void;
  recruteOnly: boolean;
  onToggleRecrute: (v: boolean) => void;
  triPar: string;
  onTriPar: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">
          {count} / {total} entreprise{total !== 1 ? "s" : ""}
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
          placeholder="Nom, secteur, description…"
          className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition"
        />
      </div>

      {/* Secteur */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Secteur d&apos;activité</label>
        <select className={selectCls} value={filters.secteur} onChange={(e) => onChange("secteur", e.target.value)}>
          <option value="">Tous les secteurs</option>
          {SECTEURS.map((s) => <option key={s}>{s}</option>)}
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

      {/* Checkboxes */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none mt-1">
        <input
          type="checkbox"
          checked={verifieOnly}
          onChange={(e) => onToggleVerifie(e.target.checked)}
          className="w-4 h-4 rounded accent-[#C9A84C]"
        />
        <span className="text-sm font-semibold" style={{ color: NAVY }}>
          ✓ Entreprises vérifiées
        </span>
      </label>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={recruteOnly}
          onChange={(e) => onToggleRecrute(e.target.checked)}
          className="w-4 h-4 rounded accent-[#C9A84C]"
        />
        <span className="text-sm font-semibold" style={{ color: NAVY }}>
          🔥 Recrute activement
        </span>
      </label>

      {/* Trier par */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Trier par</label>
        <select className={selectCls} value={triPar} onChange={(e) => onTriPar(e.target.value)}>
          <option value="recentes">Plus récentes en premier</option>
          <option value="az">Nom A → Z</option>
        </select>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AnnuaireEntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [recruteIds, setRecruteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(FILTERS_INIT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [verifieOnly, setVerifieOnly] = useState(false);
  const [recruteOnly, setRecruteOnly] = useState(false);
  const [triPar, setTriPar] = useState("recentes");

  useEffect(() => {
    async function fetchData() {
      // Entreprises
      const { data, error: err } = await supabase
        .from("entreprises")
        .select(
          "id, utilisateur_id, nom_entreprise, logo_url, secteur, taille, description, whatsapp, verifie, ville, pays"
        )
        .order("id", { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setEntreprises((data ?? []) as Entreprise[]);
      }

      // Offres ouvertes — table peut ne pas exister
      try {
        const { data: offresData, error: offErr } = await supabase
          .from("offres_emploi")
          .select("entreprise_utilisateur_id")
          .eq("statut", "ouverte");

        if (!offErr && offresData) {
          setRecruteIds(
            new Set(offresData.map((o) => o.entreprise_utilisateur_id as string))
          );
        }
      } catch { /* table absente */ }

      setLoading(false);
    }
    fetchData();
  }, []);

  function setFilter(key: keyof Filters, val: string) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  function resetAll() {
    setFilters(FILTERS_INIT);
    setVerifieOnly(false);
    setRecruteOnly(false);
    setTriPar("recentes");
  }

  const filtered = useMemo(() => {
    let result = entreprises.filter((e) => {
      if (filters.texte) {
        const q = normalise(filters.texte);
        const haystack = normalise(
          [e.nom_entreprise, e.secteur, e.description].filter(Boolean).join(" ")
        );
        if (!haystack.includes(q)) return false;
      }
      if (filters.secteur && e.secteur !== filters.secteur) return false;
      if (filters.pays && e.pays !== filters.pays) return false;
      if (verifieOnly && !e.verifie) return false;
      if (recruteOnly && !recruteIds.has(e.utilisateur_id)) return false;
      return true;
    });

    if (triPar === "az") {
      result = [...result].sort((a, b) =>
        a.nom_entreprise.localeCompare(b.nom_entreprise, "fr")
      );
    }
    // "recentes" : déjà trié par id desc depuis Supabase

    return result;
  }, [entreprises, filters, verifieOnly, recruteOnly, recruteIds, triPar]);

  const hasActiveFilter =
    Object.values(filters).some(Boolean) ||
    verifieOnly ||
    recruteOnly ||
    triPar !== "recentes";

  const filterPanelProps = {
    filters,
    onChange: setFilter,
    onReset: resetAll,
    count: filtered.length,
    total: entreprises.length,
    verifieOnly,
    onToggleVerifie: setVerifieOnly,
    recruteOnly,
    onToggleRecrute: setRecruteOnly,
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
            <Link
              href="/annuaire-entreprises"
              className="font-bold border-b-2 pb-0.5"
              style={{ color: NAVY, borderColor: NAVY }}
            >
              Entreprises
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
            Annuaire des entreprises
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Découvrez les entreprises qui recrutent des talents africains
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
                        verifieOnly ? "v" : null,
                        recruteOnly ? "r" : null,
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
                <p className="text-4xl mb-3">🏢</p>
                <p className="text-gray-600 font-semibold mb-1">Aucune entreprise trouvée</p>
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
                  {filtered.length} entreprise{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((e) => (
                    <EntrepriseCard
                      key={e.id}
                      e={e}
                      recrute={recruteIds.has(e.utilisateur_id)}
                    />
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
