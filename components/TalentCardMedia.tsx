"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface TalentCardMediaProps {
  id: string;
  prenom: string;
  nom: string;
  metier?: string;
  titre_poste?: string;
  description_courte?: string;
  competences?: string[];
  pays?: string;
  ville?: string;
  disponibilite?: string;
  telephone?: string;
  avatar_url?: string;
  video_url?: string;
  video_presentation_url?: string;
  preuve_url?: string;
  realisation_url?: string;
  score?: number;
  annees_experience?: number;
  niveau_experience?: string;
}

export default function TalentCardMedia({
  id, prenom, nom, metier, titre_poste, description_courte,
  competences, pays, ville, disponibilite, telephone,
  avatar_url, video_url, video_presentation_url,
  preuve_url, realisation_url, score,
  annees_experience, niveau_experience,
}: TalentCardMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = video_presentation_url || video_url || null;
  const photoSrc = realisation_url || preuve_url || null;
  const metierLabel = metier || titre_poste || "Talent";

  const badge = score && score >= 80 ? { label: "Or 🥇", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" }
              : score && score >= 50 ? { label: "Argent 🥈", cls: "bg-gray-100 text-gray-600 border-gray-300" }
              : score            ? { label: "Bronze 🥉", cls: "bg-orange-100 text-orange-600 border-orange-300" }
              : null;

  const dispo = disponibilite === "immediate" || disponibilite === "Disponible immédiatement";

  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) videoRef.current.play().catch(() => {});
        else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
      },
      { threshold: 0.4 }
    );
    obs.observe(videoRef.current);
    return () => obs.disconnect();
  }, [videoSrc]);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-2xl mx-auto">

      {/* ── MÉDIA PRINCIPAL (vidéo ou photo) — grand format ── */}
      {videoSrc ? (
        <div className="relative bg-black w-full" style={{ aspectRatio: "16/9" }}>
          <span className="absolute top-3 left-3 z-10 bg-purple-600/85 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            ▶ Preuve vidéo
          </span>
          {badge && (
            <span className={`absolute top-3 right-3 z-10 text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm ${badge.cls}`}>
              {badge.label}
            </span>
          )}
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            controls
            className="w-full h-full object-contain"
          />
        </div>
      ) : photoSrc ? (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <span className="absolute top-3 left-3 z-10 bg-emerald-600/85 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            📷 Réalisation
          </span>
          {badge && (
            <span className={`absolute top-3 right-3 z-10 text-xs font-bold px-3 py-1 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          )}
          <img src={photoSrc} alt="Réalisation" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full bg-gradient-to-br from-[#1B3A6B] to-[#0D1F3C] flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
          {avatar_url
            ? <img src={avatar_url} alt="" className="h-32 w-32 rounded-full object-cover border-4 border-[#C9A84C]" />
            : <div className="h-24 w-24 rounded-full bg-[#C9A84C] flex items-center justify-center text-white text-3xl font-bold">{prenom?.[0]}{nom?.[0]}</div>
          }
        </div>
      )}

      {/* ── IDENTITÉ + DOMAINE ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start gap-3">
          {avatar_url && (
            <img src={avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A84C] flex-shrink-0 -mt-8 ring-2 ring-white" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-[#1B3A6B] text-lg leading-tight">{prenom} {nom}</h3>
              {dispo && (
                <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  ● Disponible
                </span>
              )}
            </div>
            <p className="text-[#C9A84C] font-semibold text-sm mt-0.5">🔧 {metierLabel}</p>
            <div className="flex items-center gap-3 mt-1 text-gray-400 text-xs flex-wrap">
              {(ville || pays) && <span>📍 {ville || pays}</span>}
              {annees_experience && <span>⏱ {annees_experience} ans d&apos;exp.</span>}
              {niveau_experience && <span>· {niveau_experience}</span>}
            </div>
          </div>
        </div>

        {description_courte && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-2">{description_courte}</p>
        )}

        {competences && competences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {competences.slice(0, 4).map((c, i) => (
              <span key={i} className="text-xs bg-[#1B3A6B]/[0.08] text-[#1B3A6B] border border-[#1B3A6B]/20 px-2.5 py-0.5 rounded-full">
                {c}
              </span>
            ))}
            {competences.length > 4 && (
              <span className="text-xs text-gray-400">+{competences.length - 4}</span>
            )}
          </div>
        )}

        {videoSrc && photoSrc && (
          <div className="mt-3 rounded-xl overflow-hidden relative">
            <span className="absolute top-2 left-2 z-10 bg-emerald-600/85 text-white text-xs px-2 py-0.5 rounded-full">📷 Réalisation</span>
            <img src={photoSrc} alt="Réalisation" className="w-full max-h-48 object-cover" />
          </div>
        )}
      </div>

      {/* ── BOUTONS CONTACT ── */}
      <div className="px-5 py-4 border-t border-gray-100 grid grid-cols-3 gap-2">
        {telephone && (
          <a href={`https://wa.me/${telephone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.863L.054 23.25a.75.75 0 00.917.919l5.443-1.476A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.502-5.2-1.378l-.372-.214-3.862 1.048 1.056-3.769-.234-.388A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            WhatsApp
          </a>
        )}
        {telephone && (
          <a href={`tel:${telephone}`}
            className="flex items-center justify-center gap-1.5 bg-[#1B3A6B] hover:bg-[#142d54] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"/></svg>
            Appeler
          </a>
        )}
        <Link href={`/profil/${id}`}
          className={`flex items-center justify-center gap-1.5 bg-[#C9A84C] hover:bg-[#b8933d] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors ${!telephone ? "col-span-3" : ""}`}>
          Voir profil →
        </Link>
      </div>
    </div>
  );
}
