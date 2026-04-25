"use client";

import { useEffect, useRef, useState } from "react";
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
  verifie: boolean | null;
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
  "immédiate":  { label: "Disponible immédiatement", cls: "bg-blue-100 text-blue-800" },
  "1 mois":     { label: "Disponible dans 1 mois",   cls: "bg-orange-100 text-orange-700" },
  "négociable": { label: "Disponibilité négociable",  cls: "bg-gray-100 text-gray-600" },
};

// ─── Score et badges ──────────────────────────────────────────────────────────

function computeScore(p: Profil): number {
  let s = 0;
  if (p.avatar_url)                                              s += 15;
  if (p.has_video || p.video_presentation_url)                   s += 20;
  if (p.bio?.trim())                                             s += 10;
  if (p.competences_principales?.trim())                         s += 10;
  if (p.cv_url || p.diplome_url)                                 s += 15;
  if (p.preuve_url)                                              s += 15;
  if (p.whatsapp?.trim())                                        s +=  5;
  if (p.metier_principal?.trim() && p.niveau_experience?.trim()) s += 10;
  return s;
}

interface ScoreBadge { emoji: string; label: string; color: string; bg: string }
function getBadge(score: number): ScoreBadge {
  if (score >= 71) return { emoji: "🥇", label: "Or",     color: "#C9A84C", bg: "bg-yellow-50" };
  if (score >= 41) return { emoji: "🥈", label: "Argent", color: "#9CA3AF", bg: "bg-gray-100"  };
  return              { emoji: "🥉", label: "Bronze",  color: "#CD7F32", bg: "bg-amber-50"  };
}

// ─── Petits composants ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: "#1B3A6B" }}>
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
      className="flex items-center gap-2 rounded-xl border border-[#1B3A6B]/30 px-4 py-3 text-sm font-semibold text-[#1B3A6B] hover:bg-[#EEF2F9] transition-colors">
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
  const [entretienOpen, setEntretienOpen] = useState(false);
  const [partagerOpen, setPartagerOpen] = useState(false);

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
          verifie,
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
      <div className="min-h-screen flex flex-col bg-[#f4f7fb] font-sans">
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
      <div className="min-h-screen flex flex-col bg-[#f4f7fb] font-sans">
        <HeaderBar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-4xl mb-3">😕</p>
            <p className="font-semibold text-gray-700 mb-1">Profil introuvable</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Link href="/annuaire" className="text-sm font-semibold text-[#1B3A6B] hover:underline">
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
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] font-sans">
      <HeaderBar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-5">

        {/* ─── 1. EN-TÊTE ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Bandeau vert */}
          <div className="h-24 w-full" style={{ backgroundColor: "#1B3A6B" }} />

          <div className="px-6 pb-6 -mt-12">
            {/* Avatar */}
            <div className="mb-4">
              {profil.avatar_url ? (
                <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
                  <Image src={profil.avatar_url} alt={nomComplet} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: "#1B3A6B" }}>
                  {initiales(profil.prenom, profil.nom)}
                </div>
              )}
            </div>

            {/* Identité */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">{nomComplet}</h1>
              {profil.verifie && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: "#C9A84C" }}
                >
                  ✓ Vérifié
                </span>
              )}
            </div>
            {profil.titre_profil && (
              <p className="text-base font-medium mt-0.5" style={{ color: "#1B3A6B" }}>{profil.titre_profil}</p>
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

            {/* Score de profil */}
            {(() => {
              const score = computeScore(profil);
              const badge = getBadge(score);
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-500">Score de profil</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${badge.bg}`}
                        style={{ color: badge.color }}
                      >
                        {badge.emoji} {badge.label}
                      </span>
                      <span className="text-xs font-extrabold tabular-nums" style={{ color: badge.color }}>
                        {score} / 100
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, backgroundColor: badge.color }}
                    />
                  </div>
                </div>
              );
            })()}

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
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border-2 text-[#1B3A6B] border-[#1B3A6B] hover:bg-[#EEF2F9] transition-colors">
                  📞 Appeler
                </a>
              )}
              {profil.email && (
                <a href={`mailto:${profil.email}`}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors">
                  ✉️ Email
                </a>
              )}
              <button
                onClick={() => setPartagerOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
              >
                🔗 Partager
              </button>
            </div>
          </div>
        </div>

        {/* ─── 2. PRÉSENTATION ─────────────────────────────────────────────── */}
        {(profil.description_courte || profil.bio) && (
          <Section title="Présentation">
            {profil.description_courte && (
              <div className="rounded-xl bg-[#EEF2F9] border border-[#1B3A6B]/10 px-4 py-3 text-sm font-medium text-gray-700 mb-4 italic">
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
                    <span key={c} className="text-sm font-medium bg-[#EEF2F9] text-[#1B3A6B] rounded-lg px-3 py-1">
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
                  className="flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] hover:underline">
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
                  cls="border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#EEF2F9]"
                />
              )}
              {profil.email && (
                <ContactBtn
                  href={`mailto:${profil.email}`}
                  icon="✉️" label="Envoyer un email"
                  cls="border-2 border-gray-200 text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                />
              )}
              {whatsappNum && (
                <button
                  onClick={() => setEntretienOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1B3A6B" }}
                >
                  📅 Programmer un entretien
                </button>
              )}
            </div>
          </Section>
        )}

        {/* Modal entretien */}
        {entretienOpen && whatsappNum && (
          <EntretienModal
            prenom={profil.prenom}
            whatsappNum={whatsappNum}
            onClose={() => setEntretienOpen(false)}
          />
        )}

        {/* Modal partager */}
        {partagerOpen && (
          <PartagerModal
            prenom={profil.prenom}
            nom={profil.nom}
            utilisateurId={profil.utilisateur_id}
            onClose={() => setPartagerOpen(false)}
          />
        )}

        <div className="text-center py-4">
          <Link href="/annuaire" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">
            ← Retour à l'annuaire
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-white" style={{ backgroundColor: "#1B3A6B" }}>
        TalentProof — la preuve que la compétence mérite d'être vue.
      </footer>
    </div>
  );
}

// ─── Modal partager ce profil ─────────────────────────────────────────────────

function PartagerModal({
  prenom,
  nom,
  utilisateurId,
  onClose,
}: {
  prenom: string;
  nom: string;
  utilisateurId: string;
  onClose: () => void;
}) {
  const [copie, setCopie] = useState(false);
  const lien = typeof window !== "undefined"
    ? `${window.location.origin}/profil/${utilisateurId}`
    : `/profil/${utilisateurId}`;
  const nomComplet = `${prenom} ${nom}`.trim();
  const texteWa = `Découvrez le profil de ${nomComplet} sur TalentProof : ${lien}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(texteWa)}`;

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(lien);
    } catch {
      const el = document.createElement("textarea");
      el.value = lien;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: "#1B3A6B" }}>
          <div>
            <h2 className="text-base font-extrabold text-white">🔗 Partager ce profil</h2>
            <p className="text-xs text-white/70 mt-0.5">{nomComplet}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Lien du profil */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Lien du profil</label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <span className="flex-1 text-xs text-gray-500 truncate">{lien}</span>
            </div>
          </div>

          {/* Bouton copier */}
          <button
            onClick={copierLien}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold border-2 transition-all"
            style={{
              borderColor: copie ? "#22c55e" : "#1B3A6B",
              color: copie ? "#22c55e" : "#1B3A6B",
              backgroundColor: copie ? "#f0fdf4" : "transparent",
            }}
          >
            {copie ? "✓ Lien copié dans le presse-papier !" : "📋 Copier le lien"}
          </button>

          {/* Partager sur WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            📲 Partager sur WhatsApp
          </a>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal programmation entretien ────────────────────────────────────────────

const TYPES_ENTRETIEN = [
  { value: "En présentiel", label: "🏢 En présentiel" },
  { value: "Par téléphone", label: "📞 Par téléphone" },
  { value: "Par WhatsApp",  label: "📲 Par WhatsApp" },
  { value: "Par vidéo",     label: "📹 Par vidéo" },
];

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function EntretienModal({
  prenom,
  whatsappNum,
  onClose,
}: {
  prenom: string;
  whatsappNum: string;
  onClose: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [heure, setHeure] = useState("09:00");
  const [type, setType] = useState("Par WhatsApp");
  const [message, setMessage] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  function buildWaUrl() {
    const dateFR = formatDateFR(date);
    let text = `Bonjour ${prenom}, je souhaite programmer un entretien avec vous le ${dateFR} à ${heure} (${type}).`;
    if (message.trim()) text += ` ${message.trim()}`;
    return `https://wa.me/${whatsappNum}?text=${encodeURIComponent(text)}`;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100" style={{ backgroundColor: "#1B3A6B" }}>
          <div>
            <h2 className="text-base font-extrabold text-white">📅 Programmer un entretien</h2>
            <p className="text-xs text-white/70 mt-0.5">avec {prenom}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Formulaire */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Date souhaitée</label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Heure souhaitée</label>
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B3A6B]"
              />
            </div>
          </div>

          {/* Type d'entretien */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">Type d&apos;entretien</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES_ENTRETIEN.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    type === value
                      ? "border-[#1B3A6B] bg-[#EEF2F9] font-semibold text-[#1B3A6B]"
                      : "border-gray-200 text-gray-600 hover:border-[#1B3A6B]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="type_entretien"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Message optionnel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Message complémentaire <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex : Je suis disponible toute la journée si cet horaire ne vous convient pas."
              rows={3}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#1B3A6B]"
            />
          </div>

          {/* Aperçu du message */}
          <div className="rounded-xl bg-[#EEF2F9] border border-[#1B3A6B]/10 px-4 py-3">
            <p className="text-xs font-bold text-[#1B3A6B] mb-1">Aperçu du message</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bonjour {prenom}, je souhaite programmer un entretien avec vous le{" "}
              <strong>{date ? formatDateFR(date) : "…"}</strong> à{" "}
              <strong>{heure || "…"}</strong> (<em>{type}</em>).
              {message.trim() ? ` ${message.trim()}` : ""}
            </p>
          </div>
        </div>

        {/* Bouton envoi */}
        <div className="px-6 pb-6">
          <a
            href={buildWaUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            📲 Envoyer via WhatsApp
          </a>
          <button
            onClick={onClose}
            className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Header partagé ───────────────────────────────────────────────────────────

function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
        </Link>
        <Link href="/annuaire" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">
          ← Annuaire
        </Link>
      </div>
    </header>
  );
}
