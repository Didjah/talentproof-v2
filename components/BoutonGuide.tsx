"use client";

import { useState } from "react";
import Link from "next/link";

const NAVY = "#1B3A6B";
const GOLD  = "#C9A84C";

export interface ManquantItem {
  icon: string;
  label: string;
  points: number;
  href: string;
}

interface Props {
  score: number;
  manquants: ManquantItem[];
}

export default function BoutonGuide({ score, manquants }: Props) {
  const [open, setOpen] = useState(false);

  const scoreLabel = score <= 40 ? "🥉 Bronze" : score <= 70 ? "🥈 Argent" : "🥇 Or";
  const scoreColor = score <= 40 ? "#EF4444" : score <= 70 ? "#F97316" : "#22C55E";
  const prochainNiveau = score <= 40 ? "Argent" : score <= 70 ? "Or" : null;
  const pointsManquants = manquants.reduce((acc, m) => acc + m.points, 0);

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(201,168,76,0.45)]"
        style={{ backgroundColor: NAVY }}
        aria-label="Ouvrir le guide"
      >
        <span className="text-lg">💡</span>
        <span className="text-sm font-bold">Guide</span>
        {manquants.length > 0 && (
          <span
            className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: GOLD }}
          >
            {manquants.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col overflow-hidden">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-100">
            <div>
              <p className="font-bold text-base" style={{ color: NAVY }}>
                💡 Améliorez votre score
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {scoreLabel} —{" "}
                <span className="font-semibold" style={{ color: scoreColor }}>
                  {score}/100
                </span>
                {prochainNiveau && (
                  <> · +{pointsManquants} pts disponibles</>
                )}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Score bar */}
          <div className="px-6 py-3 shrink-0">
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${score}%`,
                  backgroundColor: scoreColor,
                }}
              />
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col gap-3">

            {manquants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-bold text-base" style={{ color: NAVY }}>
                  Profil complet !
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Votre profil est au maximum. Vous êtes visible par les recruteurs.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                  Éléments manquants
                </p>
                {manquants.map(({ icon, label, points, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 hover:border-[#C9A84C]/50 hover:bg-[#FFFBF0] transition-all duration-200 group"
                  >
                    <span className="text-2xl shrink-0">{icon}</span>
                    <span className="flex-1 text-sm font-semibold text-gray-800 group-hover:text-[#1B3A6B] transition-colors">
                      {label}
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: GOLD }}
                    >
                      +{points} pts
                    </span>
                    <span className="text-gray-300 group-hover:text-[#C9A84C] transition-colors shrink-0">
                      →
                    </span>
                  </Link>
                ))}

                {prochainNiveau && (
                  <div
                    className="mt-2 rounded-2xl border-2 border-dashed p-4 text-center"
                    style={{ borderColor: GOLD + "50" }}
                  >
                    <p className="text-xs font-bold mb-1" style={{ color: NAVY }}>
                      🎯 Objectif : niveau {prochainNiveau === "Argent" ? "🥈 Argent" : "🥇 Or"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {prochainNiveau === "Argent"
                        ? `Complétez encore ${Math.max(0, 41 - score)} pts pour passer Argent.`
                        : `Complétez encore ${Math.max(0, 71 - score)} pts pour passer Or.`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
