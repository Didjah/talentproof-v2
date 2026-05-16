"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD  = "#C9A84C";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CentreFormation {
  id: string;
  utilisateur_id: string;
  nom_centre: string;
  logo_url: string | null;
  domaine: string | null;
  description: string | null;
  taux_reussite: number | null;
  nombre_apprenants: number | null;
  verifie: boolean | null;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const DOMAINES = [
  "BTP", "Santé", "Tech / Informatique", "Transport / Logistique",
  "Agriculture", "Commerce / Vente", "Restauration / Hôtellerie",
  "Finance / Banque", "Éducation / Formation", "Autre",
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function initiales(nom: string) {
  return nom.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function normalise(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ─── Carte centre ─────────────────────────────────────────────────────────────

function CentreCard({ c }: { c: CentreFormation }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-3 w-full" style={{ backgroundColor: NAVY }} />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Logo + identité */}
        <div className="flex items-center gap-3">
          {c.logo_url ? (
            <img
              src={c.logo_url}
              alt={c.nom_centre}
              className="w-14 h-14 rounded-xl object-contain border border-gray-200 shrink-0 bg-white"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: NAVY }}
            >
              {initiales(c.nom_centre)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-gray-900 truncate">{c.nom_centre}</p>
              {c.verifie && (
                <span
                  className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  ✓ Vérifié
                </span>
              )}
            </div>
            {c.domaine && (
              <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
                {c.domaine}
              </p>
            )}
          </div>
        </div>

        {/* Taux de réussite */}
        {c.taux_reussite != null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full"
                style={{ width: `${Math.min(c.taux_reussite, 100)}%`, backgroundColor: GOLD }}
              />
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: NAVY }}>
              {c.taux_reussite}% de réussite
            </span>
          </div>
        )}

        {/* Nombre d'apprenants */}
        {c.nombre_apprenants != null && (
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Apprenants formés :</span>{" "}
            {c.nombre_apprenants.toLocaleString("fr-FR")}
          </p>
        )}

        {/* Description */}
        {c.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {c.description}
          </p>
        )}
      </div>

      {/* Bouton */}
      <div className="px-5 pb-5">
        <Link
          href={`/centre/${c.utilisateur_id}`}
          className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          Voir le centre
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
  domaine: string;
}

const FILTERS_INIT: Filters = { texte: "", domaine: "" };

interface FilterPanelProps {
  filters: Filters;
  onChange: (key: keyof Filters, val: string) => void;
  onReset: () => void;
  count: number;
  total: number;
  verifieOnly: boolean;
  onToggleVerifie: (v: boolean) => void;
  certifieOnly: boolean;
  onToggleCertifie: (v: boolean) => void;
  triPar: string;
  onTriPar: (v: string) => void;
}

function FilterPanel({
  filters, onChange, onReset, count, total,
  verifieOnly, onToggleVerifie,
  certifieOnly, onToggleCertifie,
  triPar, onTriPar,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">
          {count} / {total} centre{total !== 1 ? "s" : ""}
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
          placeholder="Nom, domaine, description…"
          className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition"
        />
      </div>

      {/* Domaine */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Domaine de formation</label>
        <select className={selectCls} value={filters.domaine} onChange={(e) => onChange("domaine", e.target.value)}>
          <option value="">Tous les domaines</option>
          {DOMAINES.map((d) => <option key={d}>{d}</option>)}
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
          ✓ Centres vérifiés seulement
        </span>
      </label>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={certifieOnly}
          onChange={(e) => onToggleCertifie(e.target.checked)}
          className="w-4 h-4 rounded accent-[#C9A84C]"
        />
        <span className="text-sm font-semibold" style={{ color: NAVY }}>
          🏅 Certifié
        </span>
      </label>

      {/* Trier par */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Trier par</label>
        <select className={selectCls} value={triPar} onChange={(e) => onTriPar(e.target.value)}>
          <option value="recentes">Plus récents en premier</option>
          <option value="az">Nom A → Z</option>
          <option value="taux">Taux de réussite décroissant</option>
        </select>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AnnuaireCentresPage() {
  const [centres, setCentres] = useState<CentreFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(FILTERS_INIT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [verifieOnly, setVerifieOnly] = useState(false);
  const [certifieOnly, setCertifieOnly] = useState(false);
  const [triPar, setTriPar] = useState("recentes");

  useEffect(() => {
    async function fetchData() {
      const { data, error: err } = await supabase
        .from("centres_formation")
        .select(
          "id, utilisateur_id, nom_centre, logo_url, domaine, description, taux_reussite, nombre_apprenants, verifie"
        )
        .order("id", { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setCentres((data ?? []) as CentreFormation[]);
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
    setVerifieOnly(false);
    setCertifieOnly(false);
    setTriPar("recentes");
  }

  const filtered = useMemo(() => {
    let result = centres.filter((c) => {
      if (filters.texte) {
        const q = normalise(filters.texte);
        const haystack = normalise(
          [c.nom_centre, c.domaine, c.description].filter(Boolean).join(" ")
        );
        if (!haystack.includes(q)) return false;
      }
      if (filters.domaine && c.domaine !== filters.domaine) return false;
      if (verifieOnly && !c.verifie) return false;
      if (certifieOnly && !c.verifie) return false;
      return true;
    });

    if (triPar === "az") {
      result = [...result].sort((a, b) =>
        a.nom_centre.localeCompare(b.nom_centre, "fr")
      );
    } else if (triPar === "taux") {
      result = [...result].sort((a, b) =>
        (b.taux_reussite ?? -1) - (a.taux_reussite ?? -1)
      );
    }

    return result;
  }, [centres, filters, verifieOnly, certifieOnly, triPar]);

  const hasActiveFilter =
    Object.values(filters).some(Boolean) ||
    verifieOnly ||
    certifieOnly ||
    triPar !== "recentes";

  const filterPanelProps: FilterPanelProps = {
    filters,
    onChange: setFilter,
    onReset: resetAll,
    count: filtered.length,
    total: centres.length,
    verifieOnly,
    onToggleVerifie: setVerifieOnly,
    certifieOnly,
    onToggleCertifie: setCertifieOnly,
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
            <Link
              href="/annuaire-centres"
              className="font-bold border-b-2 pb-0.5"
              style={{ color: NAVY, borderColor: NAVY }}
            >
              Centres
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
            Annuaire des centres de formation
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Trouvez la formation qui correspond à votre projet professionnel
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
                        certifieOnly ? "c" : null,
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
                <p className="text-4xl mb-3">🎓</p>
                <p className="text-gray-600 font-semibold mb-1">Aucun centre trouvé</p>
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
                  {filtered.length} centre{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((c) => (
                    <CentreCard key={c.id} c={c} />
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
