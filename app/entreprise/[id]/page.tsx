"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

interface Entreprise {
  id: string;
  utilisateur_id: string;
  nom_entreprise: string;
  secteur: string | null;
  taille: string | null;
  annee_creation: number | null;
  pays: string | null;
  ville: string | null;
  adresse: string | null;
  logo_url: string | null;
  description: string | null;
  mission: string | null;
  vision: string | null;
  valeurs: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  site_web: string | null;
  telephone: string | null;
  whatsapp: string | null;
  email: string | null;
  nom_responsable: string | null;
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

function externalHref(url: string) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

export default function EntreprisePage() {
  const { id } = useParams<{ id: string }>();
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntreprise() {
      const { data } = await supabase
        .from("entreprises")
        .select("*")
        .eq("utilisateur_id", id)
        .single();
      setEntreprise(data as Entreprise | null);
      setLoading(false);
    }
    fetchEntreprise();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-[#1B3A6B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={{ backgroundColor: "#EEF2F9" }}>
        <p className="text-2xl font-bold" style={{ color: NAVY }}>Entreprise introuvable</p>
        <p className="text-gray-500 text-sm">Ce profil n&apos;existe pas ou n&apos;est pas encore publié.</p>
        <Link href="/annuaire" className="rounded-full px-6 py-2 text-sm font-semibold text-white" style={{ backgroundColor: NAVY }}>
          Retour à l&apos;annuaire
        </Link>
      </div>
    );
  }

  const lieu = [entreprise.ville, entreprise.pays].filter(Boolean).join(", ");
  const hasContact = entreprise.whatsapp || entreprise.email || entreprise.site_web;
  const hasSocial = entreprise.facebook || entreprise.linkedin || entreprise.instagram;
  const hasPresentation = entreprise.description || entreprise.mission || entreprise.vision || entreprise.valeurs;

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
        {/* En-tête entreprise */}
        <section className="px-4 py-12" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo ou initiales */}
            {entreprise.logo_url ? (
              <img
                src={entreprise.logo_url}
                alt={entreprise.nom_entreprise}
                className="w-24 h-24 rounded-2xl object-contain bg-white border border-gray-200 shadow-sm shrink-0"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                style={{ backgroundColor: NAVY }}
              >
                {initiales(entreprise.nom_entreprise)}
              </div>
            )}

            {/* Identité */}
            <div className="flex flex-col gap-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{ color: NAVY }}>
                  {entreprise.nom_entreprise}
                </h1>
                {entreprise.verifie && (
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
                {entreprise.secteur && <span>🏭 {entreprise.secteur}</span>}
                {entreprise.taille && <span>👥 {entreprise.taille}</span>}
                {entreprise.annee_creation && <span>📅 Fondée en {entreprise.annee_creation}</span>}
              </div>
              {lieu && (
                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                  <span>📍</span> {lieu}
                </p>
              )}

              {/* Boutons contact rapide */}
              {hasContact && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                  {entreprise.whatsapp && (
                    <a
                      href={`https://wa.me/${entreprise.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      📲 WhatsApp
                    </a>
                  )}
                  {entreprise.email && (
                    <a
                      href={`mailto:${entreprise.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: NAVY }}
                    >
                      ✉️ Email
                    </a>
                  )}
                  {entreprise.site_web && (
                    <a
                      href={externalHref(entreprise.site_web)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border-2 transition-colors hover:bg-[#1B3A6B] hover:text-white"
                      style={{ borderColor: NAVY, color: NAVY }}
                    >
                      🌐 Site web
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
            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-bold border-b pb-2" style={{ color: NAVY, borderColor: NAVY + "33" }}>
                Présentation
              </h2>
              {entreprise.description && (
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{entreprise.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {entreprise.mission && (
                  <div className="rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ backgroundColor: "#EEF2F9" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Mission</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{entreprise.mission}</p>
                  </div>
                )}
                {entreprise.vision && (
                  <div className="rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ backgroundColor: "#EEF2F9" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Vision</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{entreprise.vision}</p>
                  </div>
                )}
                {entreprise.valeurs && (
                  <div className="rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ backgroundColor: "#EEF2F9" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>Valeurs</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{entreprise.valeurs}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Réseaux sociaux */}
          {hasSocial && (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-bold border-b pb-2" style={{ color: NAVY, borderColor: NAVY + "33" }}>
                Réseaux sociaux
              </h2>
              <div className="flex flex-wrap gap-3">
                {entreprise.facebook && (
                  <a
                    href={externalHref(entreprise.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors"
                  >
                    📘 Facebook
                  </a>
                )}
                {entreprise.linkedin && (
                  <a
                    href={externalHref(entreprise.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors"
                  >
                    💼 LinkedIn
                  </a>
                )}
                {entreprise.instagram && (
                  <a
                    href={externalHref(entreprise.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors"
                  >
                    📸 Instagram
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Offres d'emploi */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold border-b pb-2" style={{ color: NAVY, borderColor: NAVY + "33" }}>
              Offres d&apos;emploi
            </h2>
            <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-medium">Aucune offre en ce moment</p>
              <p className="text-xs mt-1">Revenez bientôt ou contactez l&apos;entreprise directement.</p>
            </div>
          </section>

          {/* Contact en grand */}
          {hasContact && (
            <section className="rounded-3xl p-8 sm:p-10 text-center" style={{ backgroundColor: NAVY }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Contacter {entreprise.nom_entreprise}
              </h2>
              <p className="text-white/70 text-sm mb-8">
                Choisissez le moyen de contact qui vous convient le mieux.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {entreprise.whatsapp && (
                  <a
                    href={`https://wa.me/${entreprise.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    📲 WhatsApp
                  </a>
                )}
                {entreprise.email && (
                  <a
                    href={`mailto:${entreprise.email}`}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    ✉️ Email
                  </a>
                )}
                {entreprise.site_web && (
                  <a
                    href={externalHref(entreprise.site_web)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[#1B3A6B]"
                  >
                    🌐 Site web
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
