"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD  = "#C9A84C";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Talent {
  id: string;
  utilisateur_id: string;
  metier_principal: string;
  disponibilite: string;
  avatar_url: string | null;
  has_video: boolean | null;
  utilisateurs: { prenom: string; nom: string; pays: string; ville: string } | null;
}

interface Offre {
  id: string;
  titre: string;
  type_contrat: string | null;
  ville: string | null;
  pays: string | null;
  salaire_propose: string | null;
  created_at: string;
}

interface Stats {
  talents: number;
  offres: number;
  pays: number;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const PAYS_LIST = [
  "Guinée", "Sénégal", "Mali", "Côte d'Ivoire", "Burkina Faso",
  "Cameroun", "Togo", "Bénin", "Niger", "Mauritanie",
  "France", "Belgique", "Canada", "Maroc", "Autre",
];

const DISPO: Record<string, { label: string; cls: string }> = {
  "immédiate":  { label: "Dispo. immédiate", cls: "bg-blue-100 text-blue-800" },
  "1 mois":     { label: "Dispo. 1 mois",    cls: "bg-orange-100 text-orange-700" },
  "négociable": { label: "Négociable",        cls: "bg-gray-100 text-gray-600" },
};

const CONTRAT_COLORS: Record<string, string> = {
  CDI: "bg-blue-100 text-blue-700",
  CDD: "bg-purple-100 text-purple-700",
  Freelance: "bg-orange-100 text-orange-700",
  Stage: "bg-teal-100 text-teal-700",
  Alternance: "bg-indigo-100 text-indigo-700",
};

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

function ageEnJours(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function dateRelative(dateStr: string) {
  const j = ageEnJours(dateStr);
  if (j === 0) return "Aujourd'hui";
  if (j === 1) return "Il y a 1 jour";
  if (j < 30)  return `Il y a ${j} jours`;
  return `Il y a ${Math.floor(j / 30)} mois`;
}

// ─── Particules hero ──────────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size:  8 + (i * 7) % 14,
  left:  (i * 67 + 11) % 90 + 5,
  top:   (i * 43 + 7)  % 80 + 5,
  dur:   4 + (i * 1.3) % 6,
  delay: (i * 0.7) % 5,
  opacity: 0.06 + (i % 5) * 0.025,
}));

function HeroParticles() {
  return (
    <>
      <style>{`
        @keyframes tp-float {
          0%   { opacity: 0;    transform: translateY(0)     scale(1);   }
          40%  { opacity: 1;                                              }
          100% { opacity: 0;    transform: translateY(-90px) scale(0.4); }
        }
      `}</style>
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: GOLD,
            opacity: p.opacity,
            animation: `tp-float ${p.dur}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}

// ─── Carte talent ─────────────────────────────────────────────────────────────

function TalentCard({ t }: { t: Talent }) {
  const prenom = t.utilisateurs?.prenom ?? "";
  const nom    = t.utilisateurs?.nom    ?? "";
  const nom_complet = `${prenom} ${nom}`.trim() || "Talent";
  const lieu   = [t.utilisateurs?.ville, t.utilisateurs?.pays].filter(Boolean).join(", ");
  const dispo  = DISPO[t.disponibilite] ?? DISPO["négociable"];

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-2 w-full" style={{ backgroundColor: NAVY }} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3">
          {t.avatar_url ? (
            <img
              src={t.avatar_url}
              alt={nom_complet}
              className="w-12 h-12 rounded-full object-cover shrink-0 border-2"
              style={{ borderColor: NAVY + "33" }}
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
            <p className="font-bold text-gray-900 truncate">{nom_complet}</p>
            <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
              {t.metier_principal || "—"}
            </p>
          </div>
        </div>
        {lieu && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>📍</span> {lieu}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${dispo.cls}`}>
            {dispo.label}
          </span>
          {t.has_video && (
            <span className="text-xs font-semibold bg-blue-50 text-blue-600 rounded-full px-2.5 py-1">
              ✓ Vidéo
            </span>
          )}
        </div>
      </div>
      <div className="px-5 pb-5">
        <Link
          href={`/profil/${t.utilisateur_id}`}
          className="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          Voir le profil
        </Link>
      </div>
    </div>
  );
}

// ─── Carte offre ──────────────────────────────────────────────────────────────

function OffreCard({ o }: { o: Offre }) {
  const urgent = ageEnJours(o.created_at) < 3;
  const lieu   = [o.ville, o.pays].filter(Boolean).join(", ");
  const cls    = CONTRAT_COLORS[o.type_contrat ?? ""] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-2 w-full" style={{ backgroundColor: NAVY }} />
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="font-bold text-base leading-snug" style={{ color: NAVY }}>
          {o.titre}
        </h3>
        <div className="flex flex-wrap gap-2">
          {urgent && (
            <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-3 py-1">
              🚨 Urgent
            </span>
          )}
          {o.type_contrat && (
            <span className={`rounded-full text-xs font-bold px-2.5 py-0.5 ${cls}`}>
              {o.type_contrat}
            </span>
          )}
        </div>
        {lieu && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>📍</span> {lieu}
          </p>
        )}
        {o.salaire_propose && (
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Salaire :</span> {o.salaire_propose}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-auto pt-1">🕐 {dateRelative(o.created_at)}</p>
      </div>
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();

  // Données
  const [talents, setTalents] = useState<Talent[]>([]);
  const [offres,  setOffres]  = useState<Offre[]>([]);
  const [stats,   setStats]   = useState<Stats>({ talents: 0, offres: 0, pays: 15 });
  const [loading, setLoading] = useState(true);

  // Recherche hero
  const [searchMetier, setSearchMetier] = useState("");
  const [searchPays,   setSearchPays]   = useState("");

  // Filtre talents
  const [filtreTab, setFiltreTab] = useState<"tous" | "disponibles" | "gold">("tous");

  useEffect(() => {
    async function load() {
      const [talentsRes, offresRes, statsRes] = await Promise.all([
        supabase
          .from("talents")
          .select("id, utilisateur_id, metier_principal, disponibilite, avatar_url, has_video, utilisateurs(prenom, nom, pays, ville)")
          .eq("profil_public", true)
          .order("id", { ascending: false })
          .limit(6),
        supabase
          .from("offres_emploi")
          .select("id, titre, type_contrat, ville, pays, salaire_propose, created_at")
          .eq("statut", "ouverte")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("talents")
          .select("*", { count: "exact", head: true })
          .eq("profil_public", true),
      ]);

      if (talentsRes.data) setTalents(talentsRes.data as unknown as Talent[]);
      if (offresRes.data)  setOffres(offresRes.data as Offre[]);
      if (statsRes.count != null) {
        setStats((s) => ({ ...s, talents: statsRes.count! }));
      }
      // Compte d'offres ouvertes pour stats
      const { count: nbOffres } = await supabase
        .from("offres_emploi")
        .select("*", { count: "exact", head: true })
        .eq("statut", "ouverte");
      if (nbOffres != null) setStats((s) => ({ ...s, offres: nbOffres }));

      setLoading(false);
    }
    load();
  }, []);

  const talentsFiltres = useMemo(() => {
    if (filtreTab === "disponibles") return talents.filter((t) => t.disponibilite === "immédiate");
    if (filtreTab === "gold")        return talents.filter((t) => t.has_video === true);
    return talents;
  }, [talents, filtreTab]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchMetier.trim()) params.set("metier", searchMetier.trim());
    if (searchPays)          params.set("pays",   searchPays);
    router.push(`/annuaire?${params.toString()}`);
  }

  const STAT_ITEMS = [
    { value: loading ? "—" : stats.talents.toLocaleString("fr-FR"), label: "Talents inscrits" },
    { value: loading ? "—" : stats.offres.toLocaleString("fr-FR"),  label: "Offres ouvertes"  },
    { value: "15+",                                                   label: "Pays représentés" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">

      {/* ── SECTION 1 — HERO ─────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-4"
        style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0D1F3C 100%)` }}
      >
        <HeroParticles />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl w-full text-center">
          {/* Logo */}
          <img src="/logo.png" alt="TalentProof" style={{ height: "48px", width: "auto" }} />

          {/* Slogan */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
              La preuve que la compétence<br className="hidden sm:block" />
              mérite d&apos;être vue
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
              Connectez talents africains et opportunités — sans barrières de diplôme
            </p>
          </div>

          {/* Barre de recherche */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-2"
          >
            <input
              type="text"
              value={searchMetier}
              onChange={(e) => setSearchMetier(e.target.value)}
              placeholder="Quel métier recherchez-vous ?"
              className="flex-1 rounded-xl px-4 py-3 text-sm bg-white text-gray-900 outline-none placeholder-gray-400 min-w-0"
            />
            <select
              value={searchPays}
              onChange={(e) => setSearchPays(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm bg-white text-gray-700 outline-none sm:w-44 shrink-0"
            >
              <option value="">Tous les pays</option>
              {PAYS_LIST.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button
              type="submit"
              className="rounded-xl px-6 py-3 text-sm font-bold text-white shrink-0 transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              Rechercher
            </button>
          </form>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/inscription?role=talent"
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              Je suis un talent →
            </Link>
            <Link
              href="/espace-recruteur"
              className="rounded-full px-8 py-3 text-sm font-bold border-2 border-white text-white transition-colors hover:bg-white hover:text-[#1B3A6B]"
            >
              Je recrute →
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mt-2">
            {STAT_ITEMS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl font-extrabold" style={{ color: GOLD }}>
                  {value}
                </span>
                <span className="text-xs text-white/60 uppercase tracking-wider font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Flèche scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60">
          <style>{`
            @keyframes tp-bounce {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(8px); }
            }
          `}</style>
          <span
            className="text-white text-2xl"
            style={{ animation: "tp-bounce 1.6s ease-in-out infinite" }}
          >
            ↓
          </span>
          <span className="text-white/50 text-xs">Défiler</span>
        </div>
      </section>

      {/* ── SECTION 2 — TALENTS ──────────────────────────────────────── */}
      <section className="px-4 py-16 bg-[#f4f7fb]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: NAVY }}>
                Talents disponibles maintenant
              </h2>
              <p className="text-gray-500 text-sm mt-1">Profils vérifiés, prêts à être recrutés</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {(["tous", "disponibles", "gold"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFiltreTab(tab)}
                  className="rounded-full px-4 py-2 text-xs font-bold border-2 transition-colors"
                  style={
                    filtreTab === tab
                      ? { backgroundColor: NAVY, borderColor: NAVY, color: "white" }
                      : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#374151" }
                  }
                >
                  {tab === "tous" ? "Tous" : tab === "disponibles" ? "Disponibles" : "Gold 🥇"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white h-48 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : talentsFiltres.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center">
              <p className="text-gray-400 text-sm">Aucun talent dans cette catégorie pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {talentsFiltres.map((t) => <TalentCard key={t.id} t={t} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/annuaire"
              className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-3 text-sm font-bold transition-colors hover:text-white"
              style={{ borderColor: NAVY, color: NAVY }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = NAVY;
                (e.currentTarget as HTMLElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.color = NAVY;
              }}
            >
              Voir tous les talents →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — OFFRES ───────────────────────────────────────── */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: NAVY }}>
                Offres d&apos;emploi récentes
              </h2>
              <p className="text-gray-500 text-sm mt-1">Postes ouverts en ce moment</p>
            </div>
            <Link
              href="/annuaire-offres"
              className="text-sm font-bold hover:underline shrink-0"
              style={{ color: GOLD }}
            >
              Voir toutes les offres →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 h-48 animate-pulse" />
              ))}
            </div>
          ) : offres.length === 0 ? (
            <div className="rounded-2xl bg-[#f4f7fb] border border-gray-100 py-16 text-center">
              <p className="text-gray-400 text-sm">Aucune offre ouverte pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {offres.map((o) => <OffreCard key={o.id} o={o} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4 — POURQUOI TALENTPROOF ─────────────────────────── */}
      <section className="px-4 py-16 bg-[#f4f7fb]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2" style={{ color: NAVY }}>
            Pourquoi TalentProof ?
          </h2>
          <p className="text-gray-500 text-sm text-center mb-12 max-w-lg mx-auto">
            Une plateforme pensée pour valoriser les vraies compétences africaines
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "Compétences prouvées",
                desc: "Vidéos, photos, réalisations concrètes — chaque profil est une preuve tangible de ce que sait faire le talent.",
              },
              {
                icon: "🌍",
                title: "55 pays africains",
                desc: "Un réseau panafricain qui connecte talents et opportunités à travers tout le continent et la diaspora.",
              },
              {
                icon: "⚡",
                title: "Sans diplôme requis",
                desc: "Ce que vous savez faire compte plus que vos diplômes. Chaque compétence mérite d'être vue et valorisée.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ backgroundColor: NAVY + "12" }}
                >
                  {icon}
                </div>
                <p className="text-lg font-bold" style={{ color: NAVY }}>{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — CTA FINAL ────────────────────────────────────── */}
      <section
        className="px-4 py-20 text-center"
        style={{ backgroundColor: NAVY }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Prêt à prouver votre talent ?
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-lg">
            Rejoignez des milliers de talents africains qui valorisent leurs compétences réelles chaque jour.
          </p>
          <Link
            href="/inscription?role=talent"
            className="rounded-full px-10 py-4 text-base font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Créer mon profil gratuitement →
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 mt-4 text-sm text-white/50">
            <span>✓ Gratuit</span>
            <span>✓ Sans diplôme requis</span>
            <span>✓ Visible par les recruteurs</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-white/10">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <img src="/logo.png" alt="TalentProof" style={{ height: "40px", width: "auto" }} />
            <p className="text-white/70 text-sm leading-relaxed">
              La plateforme qui prouve que la compétence mérite d&apos;être vue.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Annuaires</p>
            {[
              { label: "Talents",     href: "/annuaire" },
              { label: "Entreprises", href: "/annuaire-entreprises" },
              { label: "Centres",     href: "/annuaire-centres" },
              { label: "Offres",      href: "/annuaire-offres" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Je suis…</p>
            {[
              { label: "Un Talent",            href: "/inscription?role=talent" },
              { label: "Un Recruteur",          href: "/inscription?role=recruteur" },
              { label: "Une Entreprise",        href: "/inscription?role=entreprise" },
              { label: "Un Centre de formation",href: "/inscription?role=centre" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Informations</p>
            {[
              { label: "À propos",              href: "/a-propos" },
              { label: "Contact",               href: "/contact" },
              { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
              { label: "Confidentialité",        href: "/confidentialite" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <span>© 2025 TalentProof Africa. Tous droits réservés.</span>
            <span>Fait avec ❤️ pour l&apos;Afrique</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
