"use client";
import { useEffect, useRef, useState } from "react";
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
  const cardRef  = useRef<HTMLDivElement>(null);
  const [mediaType, setMediaType] = useState<"video" | "photo" | "avatar" | "none">("none");

  // Priorité : video_presentation_url > video_url > realisation_url > preuve_url > avatar_url
  const videoSrc  = video_presentation_url || video_url || null;
  const photoSrc  = realisation_url || preuve_url || null;

  useEffect(() => {
    if (videoSrc)       setMediaType("video");
    else if (photoSrc)  setMediaType("photo");
    else if (avatar_url) setMediaType("avatar");
    else                setMediaType("none");
  }, [videoSrc, photoSrc, avatar_url]);

  // Autoplay vidéo au scroll via Intersection Observer
  useEffect(() => {
    if (mediaType !== "video" || !videoRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(videoRef.current);
    return () => obs.disconnect();
  }, [mediaType]);

  const badge = score && score >= 80 ? "Or 🥇" : score && score >= 50 ? "Argent 🥈" : score ? "Bronze 🥉" : null;
  const dispo = disponibilite === "immediate" || disponibilite === "Disponible immédiatement";

  return (
    <div ref={cardRef} className="relative rounded-2xl overflow-hidden shadow-xl bg-[#0D1F3C] group"
      style={{ aspectRatio: "4/5", minWidth: 220 }}>

      {/* MÉDIA — vidéo ou photo plein cadre */}
      {mediaType === "video" && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {mediaType === "photo" && photoSrc && (
        <img
          src={photoSrc}
          alt={`${prenom} ${nom}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {(mediaType === "avatar") && avatar_url && (
        <img
          src={avatar_url}
          alt={`${prenom} ${nom}`}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}
      {mediaType === "none" && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A6B] to-[#0D1F3C]" />
      )}

      {/* Dégradé overlay bas */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Badge type de média (coin haut droit) */}
      {mediaType === "video" && (
        <span className="absolute top-3 right-3 bg-purple-600/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          ▶ Preuve vidéo
        </span>
      )}
      {mediaType === "photo" && (
        <span className="absolute top-3 right-3 bg-emerald-600/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          📷 Réalisation
        </span>
      )}

      {/* Badge score (coin haut gauche) */}
      {badge && (
        <span className="absolute top-3 left-3 bg-[#C9A84C]/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}

      {/* Infos bas de carte */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1">
          {avatar_url && (
            <img src={avatar_url} alt="" className="w-8 h-8 rounded-full border-2 border-[#C9A84C] object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">{prenom} {nom}</p>
            {metier && <p className="text-[#C9A84C] text-xs truncate">{metier}</p>}
          </div>
        </div>
        {(ville || pays) && (
          <p className="text-white/70 text-xs mb-2">📍 {ville || pays}</p>
        )}
        <div className="flex items-center gap-2">
          {dispo && (
            <span className="bg-green-500/20 border border-green-400/40 text-green-300 text-xs px-2 py-0.5 rounded-full">
              Dispo. immédiat
            </span>
          )}
          <Link href={`/profil/${id}`}
            className="ml-auto bg-[#C9A84C] hover:bg-[#b8933d] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
            Voir →
          </Link>
        </div>
      </div>
    </div>
  );
}
