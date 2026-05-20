"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface TalentCardMediaProps {
  id: string;
  prenom: string;
  nom: string;
  metier?: string;
  pays?: string;
  ville?: string;
  disponibilite?: string;
  avatar_url?: string;
  video_url?: string;
  video_presentation_url?: string;
  preuve_url?: string;
  realisation_url?: string;
  score?: number;
}

export default function TalentCardMedia({
  id, prenom, nom, metier, pays, ville, disponibilite,
  avatar_url, video_url, video_presentation_url,
  preuve_url, realisation_url, score,
}: TalentCardMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = video_presentation_url || video_url || null;
  const photoSrc = realisation_url || preuve_url || null;

  const badge = score && score >= 80 ? "Or 🥇" : score && score >= 50 ? "Argent 🥈" : score ? "Bronze 🥉" : null;
  const dispo = disponibilite === "immediate" || disponibilite === "Disponible immédiatement";

  // Autoplay vidéo au scroll
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) videoRef.current.play().catch(() => {});
        else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
      },
      { threshold: 0.5 }
    );
    obs.observe(videoRef.current);
    return () => obs.disconnect();
  }, [videoSrc]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 w-full">

      {/* EN-TÊTE — identité talent */}
      <div className="flex items-center gap-3 px-4 py-3">
        {avatar_url ? (
          <img src={avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-[#C9A84C]" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {prenom?.[0]}{nom?.[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#1B3A6B] text-sm">{prenom} {nom}</span>
            {badge && <span className="text-xs bg-[#C9A84C]/20 text-[#C9A84C] font-semibold px-2 py-0.5 rounded-full">{badge}</span>}
            {dispo && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">● Dispo. immédiat</span>}
          </div>
          {metier && <p className="text-gray-500 text-xs truncate">🔧 {metier}</p>}
          {(ville || pays) && <p className="text-gray-400 text-xs">📍 {ville || pays}</p>}
        </div>
        <Link href={`/profil/${id}`}
          className="flex-shrink-0 bg-[#1B3A6B] hover:bg-[#C9A84C] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
          Profil →
        </Link>
      </div>

      {/* VIDÉO — pleine largeur si disponible */}
      {videoSrc && (
        <div className="w-full bg-black relative">
          <span className="absolute top-2 left-2 z-10 bg-purple-600/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            ▶ Preuve vidéo
          </span>
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            controls
            className="w-full max-h-72 object-contain"
          />
        </div>
      )}

      {/* PHOTO RÉALISATION — pleine largeur si disponible */}
      {photoSrc && (
        <div className="w-full relative">
          <span className="absolute top-2 left-2 z-10 bg-emerald-600/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            📷 Réalisation
          </span>
          <img
            src={photoSrc}
            alt="Réalisation"
            className="w-full max-h-64 object-cover"
          />
        </div>
      )}

      {/* Si aucun média — placeholder */}
      {!videoSrc && !photoSrc && (
        <div className="w-full h-32 bg-gradient-to-r from-[#1B3A6B] to-[#C9A84C]/30 flex items-center justify-center">
          <span className="text-white/50 text-sm">Pas encore de preuve visuelle</span>
        </div>
      )}

      {/* PIED — bouton voir profil complet */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-gray-400 text-xs">TalentProof Africa</span>
        <Link href={`/profil/${id}`}
          className="text-[#C9A84C] hover:text-[#1B3A6B] text-xs font-semibold transition-colors">
          Voir le profil complet →
        </Link>
      </div>
    </div>
  );
}
