"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const CONTRATS = ["Tous", "CDI", "CDD", "Freelance", "Stage", "Temps partiel"];
const NIVEAUX  = ["Tous", "Débutant", "Intermédiaire", "Expert"];

interface Offre {
  id: string;
  titre: string;
  description: string | null;
  type_contrat: string | null;
  niveau_experience: string | null;
  salaire_propose: string | null;
  ville: string | null;
  pays: string | null;
  date_debut: string | null;
  statut: string;
  created_at: string;
  recruteur_utilisateur_id: string | null;
  entreprise_utilisateur_id: string | null;
  /* resolved after fetch */
  poster_nom: string;
  poster_whatsapp: string | null;
  poster_type: "recruteur" | "entreprise" | null;
}

interface PostulModal {
  offre: Offre;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function OffresPage() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [filtered, setFiltered] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<PostulModal | null>(null);

  /* filtres */
  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("");
  const [contrat, setContrat] = useState("Tous");
  const [niveau, setNiveau] = useState("Tous");

  useEffect(() => {
    async function fetchOffres() {
      const { data, error } = await supabase
        .from("offres_emploi")
        .select(`
          id, titre, description, type_contrat, niveau_experience,
          salaire_propose, ville, pays, date_debut, statut, created_at,
          recruteur_utilisateur_id, entreprise_utilisateur_id
        `)
        .in("statut", ["ouverte", "en_cours"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (error || !data) { setLoading(false); return; }

      // Résoudre les noms des recruteurs / entreprises en batch
      const recruteurIds = [...new Set(data.filter((o) => o.recruteur_utilisateur_id).map((o) => o.recruteur_utilisateur_id as string))];
      const entrepriseIds = [...new Set(data.filter((o) => o.entreprise_utilisateur_id).map((o) => o.entreprise_utilisateur_id as string))];

      const [recruteursRes, entreprisesRes] = await Promise.all([
        recruteurIds.length
          ? supabase.from("recruteurs").select("utilisateur_id, whatsapp, utilisateurs(prenom, nom)").in("utilisateur_id", recruteurIds)
          : Promise.resolve({ data: [] }),
        entrepriseIds.length
          ? supabase.from("entreprises").select("utilisateur_id, nom_entreprise, whatsapp").in("utilisateur_id", entrepriseIds)
          : Promise.resolve({ data: [] }),
      ]);

      const recruteurMap = new Map<string, { nom: string; whatsapp: string | null }>();
      ((recruteursRes.data ?? []) as unknown[]).forEach((r: unknown) => {
        const row = r as { utilisateur_id: string; whatsapp: string | null; utilisateurs: { prenom: string; nom: string } | null };
        const u = row.utilisateurs;
        recruteurMap.set(row.utilisateur_id, {
          nom: u ? `${u.prenom} ${u.nom}`.trim() : "Recruteur",
          whatsapp: row.whatsapp,
        });
      });

      const entrepriseMap = new Map<string, { nom: string; whatsapp: string | null }>();
      ((entreprisesRes.data ?? []) as unknown[]).forEach((e: unknown) => {
        const row = e as { utilisateur_id: string; nom_entreprise: string; whatsapp: string | null };
        entrepriseMap.set(row.utilisateur_id, { nom: row.nom_entreprise, whatsapp: row.whatsapp });
      });

      const resolved: Offre[] = (data as Offre[]).map((o) => {
        if (o.recruteur_utilisateur_id) {
          const r = recruteurMap.get(o.recruteur_utilisateur_id);
          return { ...o, poster_nom: r?.nom ?? "Recruteur", poster_whatsapp: r?.whatsapp ?? null, poster_type: "recruteur" };
        }
        if (o.entreprise_utilisateur_id) {
          const e = entrepriseMap.get(o.entreprise_utilisateur_id);
          return { ...o, poster_nom: e?.nom ?? "Entreprise", poster_whatsapp: e?.whatsapp ?? null, poster_type: "entreprise" };
        }
        return { ...o, poster_nom: "—", poster_whatsapp: null, poster_type: null };
      });

      setOffres(resolved);
      setFiltered(resolved);
      setLoading(false);
    }

    fetchOffres();
  }, []);

  /* Filtrage réactif */
  useEffect(() => {
    let result = offres;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.titre.toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q));
    }
    if (ville.trim()) {
      const v = ville.toLowerCase();
      result = result.filter((o) => (o.ville ?? "").toLowerCase().includes(v));
    }
    if (contrat !== "Tous") result = result.filter((o) => o.type_contrat === contrat);
    if (niveau !== "Tous") result = result.filter((o) => o.niveau_experience === niveau);
    setFiltered(result);
  }, [search, ville, contrat, niveau, offres]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Talents</Link>
            <Link href="/offres" className="font-semibold" style={{ color: NAVY }}>Offres</Link>
          </div>
          <Link
            href="/publier-offre"
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Publier une offre
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-12 text-center" style={{ backgroundColor: "#EEF2F9" }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: NAVY }}>
          Offres d&apos;emploi
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          Des opportunités vérifiées publiées par des recruteurs et entreprises en Afrique.
        </p>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ── Filtres ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher un poste…"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B]"
            />
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="📍 Ville"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={contrat} onChange={(e) => setContrat(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B] bg-white">
              {CONTRATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B] bg-white">
              {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Compteur */}
        <p className="text-sm text-gray-500 px-1">
          {loading ? "Chargement…" : `${filtered.length} offre${filtered.length !== 1 ? "s" : ""} trouvée${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {/* ── Liste des offres ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm font-medium">Aucune offre ne correspond à votre recherche</p>
            <button onClick={() => { setSearch(""); setVille(""); setContrat("Tous"); setNiveau("Tous"); }} className="mt-4 text-xs font-semibold hover:underline" style={{ color: NAVY }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((o) => (
              <OffreCard key={o.id} offre={o} onPostuler={() => setModal({ offre: o })} />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal Postuler ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: GOLD }}>Postuler à</p>
              <h2 className="text-lg font-extrabold leading-snug" style={{ color: NAVY }}>{modal.offre.titre}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{modal.offre.poster_nom}</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Envoyez votre candidature directement via WhatsApp ou consultez le profil du recruteur.
            </p>

            <div className="flex flex-col gap-3">
              {modal.offre.poster_whatsapp ? (
                <a
                  href={`https://wa.me/${modal.offre.poster_whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je souhaite postuler à votre offre : "${modal.offre.titre}". Je vous contacte via TalentProof.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                >
                  📲 Postuler via WhatsApp
                </a>
              ) : (
                <p className="text-xs text-gray-400 text-center">Pas de WhatsApp disponible pour cette offre.</p>
              )}

              {(modal.offre.recruteur_utilisateur_id || modal.offre.entreprise_utilisateur_id) && (
                <Link
                  href={
                    modal.offre.poster_type === "entreprise"
                      ? `/entreprise/${modal.offre.entreprise_utilisateur_id}`
                      : `/profil/${modal.offre.recruteur_utilisateur_id}`
                  }
                  target="_blank"
                  className="flex items-center justify-center gap-2 rounded-full border-2 py-3 text-sm font-semibold transition-colors hover:bg-[#1B3A6B] hover:text-white"
                  style={{ borderColor: NAVY, color: NAVY }}
                >
                  👤 Voir le profil du recruteur
                </Link>
              )}

              <button
                onClick={() => setModal(null)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center py-1"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-sm text-white/60" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}

/* ─── Carte offre ─────────────────────────────────────────────────────────── */

const CONTRAT_CLS: Record<string, string> = {
  CDI:           "bg-green-100 text-green-700",
  CDD:           "bg-blue-100 text-blue-700",
  Freelance:     "bg-purple-100 text-purple-700",
  Stage:         "bg-yellow-100 text-yellow-700",
  "Temps partiel":"bg-orange-100 text-orange-700",
};

function OffreCard({ offre, onPostuler }: { offre: Offre; onPostuler: () => void }) {
  const contratCls = CONTRAT_CLS[offre.type_contrat ?? ""] ?? "bg-gray-100 text-gray-600";
  const lieu = [offre.ville, offre.pays].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Titre + badge statut */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-base leading-snug flex-1" style={{ color: NAVY }}>{offre.titre}</h3>
        {offre.statut === "ouverte" && (
          <span className="shrink-0 rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-semibold">Ouverte</span>
        )}
      </div>

      {/* Poster */}
      <p className="text-sm font-semibold text-gray-600 -mt-2">{offre.poster_nom}</p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {offre.type_contrat && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${contratCls}`}>{offre.type_contrat}</span>
        )}
        {offre.niveau_experience && (
          <span className="rounded-full bg-[#EEF2F9] px-2.5 py-0.5 text-xs font-semibold" style={{ color: NAVY }}>
            {offre.niveau_experience}
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        {lieu && <span>📍 {lieu}</span>}
        {offre.salaire_propose && <span>💰 {offre.salaire_propose}</span>}
        {offre.date_debut && <span>📅 Début : {new Date(offre.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>}
        <span className="text-gray-400">Publiée le {formatDate(offre.created_at)}</span>
      </div>

      {/* Description courte */}
      {offre.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{offre.description}</p>
      )}

      {/* CTA */}
      <button
        onClick={onPostuler}
        className="mt-auto w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: NAVY }}
      >
        Postuler →
      </button>
    </div>
  );
}
