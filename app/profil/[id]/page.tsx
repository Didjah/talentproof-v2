"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/src/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profil {
  id: string;
  utilisateur_id: string;
  // Identité (depuis utilisateurs)
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  pays: string;
  ville: string;
  langues: string;
  // Profil pro
  titre_profil: string;
  metier_principal: string;
  second_metier: string;
  secteur: string;
  niveau_experience: string;
  annees_experience: number | null;
  disponibilite: string;
  type_contrat: string;
  salaire_souhaite: string;
  // Présentation
  description_courte: string;
  bio: string;
  // Compétences
  competences_principales: string;
  competences_secondaires: string;
  outils: string;
  certifications: string;
  // Médias
  avatar_url: string | null;
  video_presentation_url: string | null;
  preuve_url: string | null;
  lien_externe: string | null;
  has_video: boolean;
  has_photo: boolean;
  // Documents
  cv_url: string | null;
  diplome_url: string | null;
  attestation_url: string | null;
  certificat_url: string | null;
  lettre_url: string | null;
  // Contact & réglages
  whatsapp: string;
  appel_autorise: boolean;
  afficher_salaire: boolean;
  afficher_telephone: boolean;
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

function splitTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
}

const DISPO: Record<string, { label: string; cls: string }> = {
  "immédiate":  { label: "Disponible immédiatement", cls: "bg-green-100 text-green-700" },
  "1 mois":     { label: "Disponible dans 1 mois",   cls: "bg-orange-100 text-orange-700" },
  "négociable": { label: "Disponibilité négociable",  cls: "bg-gray-100 text-gray-600" },
};

// ─── Petits composants ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: "#1a5c3a" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 shrink-0 w-44">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function DocButton({ label, url, icon }: { label: string; url: string; icon: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-[#1a5c3a]/30 px-4 py-3 text-sm font-semibold text-[#1a5c3a] hover:bg-[#f0f7f3] transition-colors">
      <span className="text-lg">{icon}</span>
      {label}
      <span className="ml-auto text-gray-400 text-xs">↗</span>
    </a>
  );
}

function ContactBtn({ href, icon, label, cls, style }: { href: string; icon: string; label: string; cls: string; style?: React.CSSProperties }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}
      className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-opacity hover:opacity-90 ${cls}`}>
      <span>{icon}</span> {label}
    </a>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ProfilPage() {
  const { id } = useParams<{ id: string }>();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfil() {
      const { data, error } = await supabase
        .from("talents")
        .select(`
          id,
          utilisateur_id,
          titre_profil,
          metier_principal,
          second_metier,
          secteur,
          niveau_experience,
          annees_experience,
          disponibilite,
          type_contrat,
          salaire_souhaite,
          description_courte,
          bio,
          competences_principales,
          competences_secondaires,
          outils,
          certifications,
          avatar_url,
          video_presentation_url,
          preuve_url,
          lien_externe,
          has_video,
          has_photo,
          cv_url,
          diplome_url,
          attestation_url,
          certificat_url,
          lettre_url,
          langues,
          whatsapp,
          appel_autorise,
          afficher_salaire,
          afficher_telephone,
          utilisateurs (
            prenom,
            nom,
            email,
            telephone,
            pays,
            ville
          )
        `)
        .eq("utilisateur_id", id)
        .single();

      if (error || !data) {
        setError(error?.message ?? "Profil introuvable.");
      } else {
        const u = (data.utilisateurs as unknown as Record<string, string>) ?? {};
        setProfil({
          ...data,
          prenom: u.prenom ?? "",
          nom: u.nom ?? "",
          email: u.email ?? "",
          telephone: u.telephone ?? "",
          pays: u.pays ?? "",
          ville: u.ville ?? "",
          langues: (data as Record<string, unknown>).langues as string ?? "",
        } as Profil);
      }
      setLoading(false);
    }
    fetchProfil();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf9] font-sans">
        <HeaderBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 h-32 animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  if (error || !profil) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf9] font-sans">
        <HeaderBar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-4xl mb-3">😕</p>
            <p className="font-semibold text-gray-700 mb-1">Profil introuvable</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Link href="/annuaire" className="text-sm font-semibold text-[#1a5c3a] hover:underline">
              ← Retour à l'annuaire
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const nomComplet = `${profil.prenom} ${profil.nom}`.trim();
  const dispo = DISPO[profil.disponibilite] ?? DISPO["négociable"];
  const competencesPrincipales = splitTags(profil.competences_principales);
  const competencesSecondaires = splitTags(profil.competences_secondaires);
  const outils = splitTags(profil.outils);
  const certifications = splitTags(profil.certifications);
  const hasVideo = profil.has_video || Boolean(profil.video_presentation_url);
  const hasPhoto = profil.has_photo || Boolean(profil.preuve_url);

  const whatsappNum = profil.whatsapp?.replace(/\D/g, "");
  const telNum = profil.telephone?.replace(/\D/g, "");

  const docs = [
    { label: "CV", url: profil.cv_url, icon: "📄" },
    { label: "Diplôme", url: profil.diplome_url, icon: "🎓" },
    { label: "Attestation", url: profil.attestation_url, icon: "📋" },
    { label: "Certificat", url: profil.certificat_url, icon: "🏅" },
    { label: "Lettre de motivation", url: profil.lettre_url, icon: "✉️" },
  ].filter((d) => Boolean(d.url));

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] font-sans">
      <HeaderBar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-5">

        {/* ─── 1. EN-TÊTE ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Bandeau vert */}
          <div className="h-24 w-full" style={{ backgroundColor: "#1a5c3a" }} />

          <div className="px-6 pb-6 -mt-12">
            {/* Avatar */}
            <div className="mb-4">
              {profil.avatar_url ? (
                <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
                  <Image src={profil.avatar_url} alt={nomComplet} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: "#1a5c3a" }}>
                  {initiales(profil.prenom, profil.nom)}
                </div>
              )}
            </div>

            {/* Identité */}
            <h1 className="text-2xl font-extrabold text-gray-900">{nomComplet}</h1>
            {profil.titre_profil && (
              <p className="text-base font-medium mt-0.5" style={{ color: "#1a5c3a" }}>{profil.titre_profil}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
              {profil.metier_principal && <span className="font-semibold">{profil.metier_principal}</span>}
              {profil.second_metier && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>{profil.second_metier}</span>
                </>
              )}
            </div>

            {(profil.ville || profil.pays) && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span>📍</span>
                {[profil.ville, profil.pays].filter(Boolean).join(", ")}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs font-semibold rounded-full px-3 py-1 ${dispo.cls}`}>
                {dispo.label}
              </span>
              {hasVideo && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 rounded-full px-3 py-1">
                  ✓ Vidéo
                </span>
              )}
              {hasPhoto && (
                <span className="text-xs font-semibold bg-purple-50 text-purple-600 rounded-full px-3 py-1">
                  📷 Photo
                </span>
              )}
            </div>

            {/* Boutons contact rapide */}
            <div className="flex flex-wrap gap-2 mt-4">
              {whatsappNum && (
                <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#25D366" }}>
                  📲 WhatsApp
                </a>
              )}
              {profil.appel_autorise && telNum && (
                <a href={`tel:${telNum}`}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border-2 text-[#1a5c3a] border-[#1a5c3a] hover:bg-[#f0f7f3] transition-colors">
                  📞 Appeler
                </a>
              )}
              {profil.email && (
                <a href={`mailto:${profil.email}`}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:border-[#1a5c3a] hover:text-[#1a5c3a] transition-colors">
                  ✉️ Email
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. PRÉSENTATION ─────────────────────────────────────────────── */}
        {(profil.description_courte || profil.bio) && (
          <Section title="Présentation">
            {profil.description_courte && (
              <div className="rounded-xl bg-[#f0f7f3] border border-[#1a5c3a]/10 px-4 py-3 text-sm font-medium text-gray-700 mb-4 italic">
                "{profil.description_courte}"
              </div>
            )}
            {profil.bio && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{profil.bio}</p>
            )}
          </Section>
        )}

        {/* ─── 3. COMPÉTENCES ──────────────────────────────────────────────── */}
        {(competencesPrincipales.length > 0 || competencesSecondaires.length > 0 || outils.length > 0 || certifications.length > 0) && (
          <Section title="Compétences">
            {competencesPrincipales.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Principales</p>
                <div className="flex flex-wrap gap-2">
                  {competencesPrincipales.map((c) => (
                    <span key={c} className="text-sm font-medium bg-[#f0f7f3] text-[#1a5c3a] rounded-lg px-3 py-1">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {competencesSecondaires.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Secondaires</p>
                <div className="flex flex-wrap gap-2">
                  {competencesSecondaires.map((c) => (
                    <span key={c} className="text-sm font-medium bg-gray-100 text-gray-600 rounded-lg px-3 py-1">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {outils.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Outils & Logiciels</p>
                <div className="flex flex-wrap gap-2">
                  {outils.map((o) => (
                    <span key={o} className="text-sm font-medium bg-blue-50 text-blue-700 rounded-lg px-3 py-1">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {certifications.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((c) => (
                    <span key={c} className="text-sm font-medium bg-yellow-50 text-yellow-700 rounded-lg px-3 py-1">
                      🏅 {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ─── 4. PREUVES VISUELLES ────────────────────────────────────────── */}
        {(profil.video_presentation_url || profil.preuve_url || profil.lien_externe) && (
          <Section title="Preuves visuelles">
            <div className="flex flex-col gap-5">
              {profil.video_presentation_url && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vidéo de présentation</p>
                  <video
                    src={profil.video_presentation_url}
                    controls
                    className="w-full rounded-xl bg-black max-h-80"
                    preload="metadata"
                  />
                </div>
              )}
              {profil.preuve_url && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Photo de réalisation</p>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <Image src={profil.preuve_url} alt="Photo de preuve" fill className="object-cover" />
                  </div>
                </div>
              )}
              {profil.lien_externe && (
                <a href={profil.lien_externe} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-[#1a5c3a] hover:underline">
                  🔗 Voir mon portfolio / projet en ligne ↗
                </a>
              )}
            </div>
          </Section>
        )}

        {/* ─── 5. DOCUMENTS ────────────────────────────────────────────────── */}
        {docs.length > 0 && (
          <Section title="Documents téléchargeables">
            <div className="flex flex-col gap-3">
              {docs.map((d) => (
                <DocButton key={d.label} label={d.label} url={d.url!} icon={d.icon} />
              ))}
            </div>
          </Section>
        )}

        {/* ─── 6. INFORMATIONS PROFESSIONNELLES ────────────────────────────── */}
        <Section title="Informations professionnelles">
          <div className="flex flex-col">
            <InfoRow label="Niveau d'expérience" value={profil.niveau_experience} />
            <InfoRow label="Années d'expérience" value={profil.annees_experience != null ? `${profil.annees_experience} an${profil.annees_experience > 1 ? "s" : ""}` : null} />
            <InfoRow label="Secteur d'activité" value={profil.secteur} />
            <InfoRow label="Type de contrat" value={profil.type_contrat} />
            {profil.afficher_salaire && <InfoRow label="Salaire souhaité" value={profil.salaire_souhaite} />}
            <InfoRow label="Disponibilité" value={profil.disponibilite} />
            <InfoRow label="Langues parlées" value={profil.langues} />
          </div>
        </Section>

        {/* ─── 7. CONTACT DIRECT ───────────────────────────────────────────── */}
        {(whatsappNum || (profil.appel_autorise && telNum) || profil.email) && (
          <Section title="Contacter ce talent">
            <div className="flex flex-col gap-3">
              {whatsappNum && (
                <ContactBtn
                  href={`https://wa.me/${whatsappNum}`}
                  icon="📲" label="Envoyer un message WhatsApp"
                  cls="text-white" style={{ backgroundColor: "#25D366" } as React.CSSProperties}
                />
              )}
              {profil.appel_autorise && telNum && (
                <ContactBtn
                  href={`tel:${telNum}`}
                  icon="📞" label="Appeler maintenant"
                  cls="border-2 border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#f0f7f3]"
                />
              )}
              {profil.email && (
                <ContactBtn
                  href={`mailto:${profil.email}`}
                  icon="✉️" label="Envoyer un email"
                  cls="border-2 border-gray-200 text-gray-700 hover:border-[#1a5c3a] hover:text-[#1a5c3a]"
                />
              )}
            </div>
          </Section>
        )}

        <div className="text-center py-4">
          <Link href="/annuaire" className="text-sm text-gray-500 hover:text-[#1a5c3a] transition-colors">
            ← Retour à l'annuaire
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-white" style={{ backgroundColor: "#1a5c3a" }}>
        TalentProof — la preuve que la compétence mérite d'être vue.
      </footer>
    </div>
  );
}

// ─── Header partagé ───────────────────────────────────────────────────────────

function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight" style={{ color: "#1a5c3a" }}>
          TalentProof
        </Link>
        <Link href="/annuaire" className="text-sm text-gray-500 hover:text-[#1a5c3a] transition-colors">
          ← Annuaire
        </Link>
      </div>
    </header>
  );
}
