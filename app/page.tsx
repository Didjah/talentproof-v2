"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import TalentCardMedia from "@/components/TalentCardMedia";

const NAVY      = "#1B3A6B";
const GOLD      = "#C9A84C";
const DARK_NAVY = "#0D1F3C";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Talent {
  id: string;
  utilisateur_id: string;
  metier_principal: string;
  titre_profil: string | null;
  description_courte: string | null;
  competences_principales: string | null;
  annees_experience: number | null;
  niveau_experience: string | null;
  disponibilite: string;
  avatar_url: string | null;
  has_video: boolean | null;
  video_url: string | null;
  video_presentation_url: string | null;
  preuve_url: string | null;
  realisation_url: string | null;
  telephone: string | null;
  whatsapp: string | null;
  utilisateurs: { prenom: string; nom: string; pays: string; ville: string; telephone: string } | null;
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

// ─── Particules hero ──────────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size:    8 + (i * 7) % 14,
  left:    (i * 67 + 11) % 90 + 5,
  top:     (i * 43 + 7)  % 80 + 5,
  dur:     4 + (i * 1.3) % 6,
  delay:   (i * 0.7) % 5,
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
        @keyframes tp-up-bounce {
          0%, 100% { transform: translateY(0);   opacity: 0.45; }
          50%      { transform: translateY(-7px); opacity: 1;   }
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const indicatorVisibleRef = useRef(false);
  const [talentsVisible, setTalentsVisible] = useState(false);
  const talentsVisibleRef = useRef(false);
  const touchStartYRef = useRef(0);

  const [talents, setTalents] = useState<Talent[]>([]);
  const [stats,   setStats]   = useState<Stats>({ talents: 0, offres: 0, pays: 15 });
  const [loading, setLoading] = useState(true);

  const [searchMetier, setSearchMetier] = useState("");
  const [searchPays,   setSearchPays]   = useState("");
  const [filtreTab, setFiltreTab] = useState<"tous" | "disponibles" | "gold">("tous");

  // IntersectionObserver sur l'indicateur
  useEffect(() => {
    const el = indicatorRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { indicatorVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Drawer mobile — effet unique, listeners montés une seule fois, refs pour l'état courant
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && !talentsVisibleRef.current) {
        talentsVisibleRef.current = true;
        setTalentsVisible(true);
      } else if (e.deltaY < 0 && talentsVisibleRef.current && indicatorVisibleRef.current) {
        talentsVisibleRef.current = false;
        setTalentsVisible(false);
        indicatorRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;
      if (delta > 5 && !talentsVisibleRef.current) {
        talentsVisibleRef.current = true;
        setTalentsVisible(true);
        touchStartYRef.current = currentY;
      } else if (delta < -5 && talentsVisibleRef.current && indicatorVisibleRef.current) {
        talentsVisibleRef.current = false;
        setTalentsVisible(false);
        touchStartYRef.current = currentY;
        indicatorRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("wheel",      handleWheel,      { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove",  handleTouchMove,  { passive: true });
    return () => {
      window.removeEventListener("wheel",      handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove",  handleTouchMove);
    };
  }, []);

  useEffect(() => {
    async function load() {
      const [talentsRes, statsRes] = await Promise.all([
        supabase
          .from("talents")
          .select("id, utilisateur_id, metier_principal, titre_profil, description_courte, competences_principales, annees_experience, niveau_experience, disponibilite, avatar_url, has_video, video_url, video_presentation_url, preuve_url, realisation_url, telephone, whatsapp, utilisateurs(prenom, nom, pays, ville, telephone)")
          .eq("profil_public", true)
          .order("id", { ascending: false })
          .limit(6),
        supabase
          .from("talents")
          .select("*", { count: "exact", head: true })
          .eq("profil_public", true),
      ]);

      if (talentsRes.data) setTalents(talentsRes.data as unknown as Talent[]);
      if (statsRes.count != null) setStats((s) => ({ ...s, talents: statsRes.count! }));

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
        style={{ backgroundColor: DARK_NAVY }}
      >
        <HeroParticles />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl w-full text-center">
          <img src="/logo.png" alt="TalentProof" style={{ height: "48px", width: "auto" }} />

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
              placeholder="Quel métier ?"
              className="flex-1 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 outline-none placeholder-gray-400 min-w-0"
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
              className="rounded-xl px-6 py-3 text-sm shrink-0 transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD, color: NAVY, fontWeight: 500 }}
            >
              Rechercher
            </button>
          </form>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/inscription?role=talent"
              className="rounded-full px-8 py-3 text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD, color: NAVY, fontWeight: 500 }}
            >
              Je suis un talent →
            </Link>
            <Link
              href="/espace-recruteur"
              className="rounded-full px-8 py-3 text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "white", color: NAVY, fontWeight: 500 }}
            >
              Je recrute →
            </Link>
          </div>

          {/* Lien connexion */}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
            Déjà un compte ?{" "}
            <Link
              href="/connexion"
              className="underline transition-opacity hover:opacity-80"
              style={{ color: GOLD }}
            >
              Se connecter →
            </Link>
          </p>

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
      </section>

      {/* ── SECTION 2 — POURQUOI TALENTPROOF ─────────────────────────── */}
      <section className="px-4 py-16" style={{ backgroundColor: DARK_NAVY }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 text-white">
            Pourquoi TalentProof ?
          </h2>
          <p className="text-center mb-12 max-w-lg mx-auto text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
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
                className="flex flex-col items-center text-center gap-4 rounded-2xl p-8"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  {icon}
                </div>
                <p className="text-lg font-bold text-white">{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — CTA ──────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center" style={{ backgroundColor: DARK_NAVY }}>
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Prêt à prouver votre talent ?
          </h2>
          <p className="text-sm sm:text-base max-w-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
            Rejoignez des milliers de talents africains qui valorisent leurs compétences réelles chaque jour.
          </p>
          <Link
            href="/inscription?role=talent"
            className="rounded-full px-10 py-4 text-base font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            Créer mon profil gratuitement →
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 mt-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span>✓ Gratuit</span>
            <span>✓ Sans diplôme requis</span>
            <span>✓ Visible par les recruteurs</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: DARK_NAVY }}>
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
              { label: "Un Talent",             href: "/inscription?role=talent" },
              { label: "Un Recruteur",           href: "/inscription?role=recruteur" },
              { label: "Une Entreprise",         href: "/inscription?role=entreprise" },
              { label: "Un Centre de formation", href: "/inscription?role=centre" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Informations</p>
            {[
              { label: "À propos",                 href: "/a-propos" },
              { label: "Contact",                  href: "/contact" },
              { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
              { label: "Confidentialité",           href: "/confidentialite" },
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

      {/* ── SCROLL INDICATOR ─────────────────────────────────────────── */}
      <div
        ref={indicatorRef}
        className="flex flex-col items-center gap-2 py-6"
        style={{ backgroundColor: DARK_NAVY }}
      >
        <div className="flex flex-col items-center gap-1.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              style={{ animation: `tp-up-bounce 1.4s ease-in-out ${delay}s infinite` }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRight: `2.5px solid ${GOLD}`,
                  borderBottom: `2.5px solid ${GOLD}`,
                  transform: "rotate(-135deg)",
                }}
              />
            </div>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>
          Balayez vers le bas pour voir les talents
        </p>
      </div>

      {/* ── SECTION TALENTS ──────────────────────────────────────────── */}
      <section
        className="bg-[#f4f7fb]"
        style={{
          height: talentsVisible ? "auto" : 0,
          overflow: "hidden",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        {/* Wrapper animé — slide-up + fadeIn */}
        <div
          className="pb-16"
          style={{
            opacity:    talentsVisible ? 1 : 0,
            transform:  talentsVisible ? "translateY(0)" : "translateY(100px)",
            transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s ease",
            willChange: "transform, opacity",
          }}
        >
          {/* Poignée tiroir */}
          <div className="flex justify-center pt-3 mb-8">
            <div style={{ width: 40, height: 5, borderRadius: 9999, backgroundColor: "#d1d5db" }} />
          </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: NAVY }}>
                Talents disponibles maintenant
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Profils avec preuves visuelles — photos, vidéos, réalisations
              </p>
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
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white h-48 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : talentsFiltres.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center">
              <p className="text-gray-400 text-sm">Aucun talent dans cette catégorie pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4">
              {talentsFiltres.map((t) => (
                <TalentCardMedia
                  key={t.id}
                  id={t.utilisateur_id}
                  prenom={t.utilisateurs?.prenom ?? ""}
                  nom={t.utilisateurs?.nom ?? ""}
                  metier={t.metier_principal}
                  titre_poste={t.titre_profil ?? undefined}
                  description_courte={t.description_courte ?? undefined}
                  competences={
                    t.competences_principales
                      ? t.competences_principales.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean)
                      : undefined
                  }
                  pays={t.utilisateurs?.pays}
                  ville={t.utilisateurs?.ville}
                  disponibilite={t.disponibilite}
                  telephone={t.telephone || t.utilisateurs?.telephone || undefined}
                  avatar_url={t.avatar_url ?? undefined}
                  video_url={t.video_url ?? undefined}
                  video_presentation_url={t.video_presentation_url ?? undefined}
                  preuve_url={t.preuve_url ?? undefined}
                  realisation_url={t.realisation_url ?? undefined}
                  annees_experience={t.annees_experience ?? undefined}
                  niveau_experience={t.niveau_experience ?? undefined}
                />
              ))}
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
        </div>
      </section>
    </div>
  );
}
