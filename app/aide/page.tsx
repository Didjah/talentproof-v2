"use client";

import { useState } from "react";
import Link from "next/link";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const faqs = [
  {
    q: "Comment créer mon profil ?",
    a: "Clique sur « Créer mon profil » en haut de la page, choisis ton rôle (Talent, Recruteur, Entreprise ou Centre de formation), puis remplis le formulaire en 5 étapes. Il faut quelques minutes et un numéro de téléphone pour commencer.",
  },
  {
    q: "Comment modifier mes informations ?",
    a: "Connecte-toi avec ton numéro de téléphone et ton code PIN, puis accède à ton tableau de bord. Tu pourras y modifier chaque section de ton profil : bio, compétences, photos, vidéo, documents et paramètres de confidentialité.",
  },
  {
    q: "Comment postuler à une offre ?",
    a: "Depuis l'annuaire des offres, clique sur une offre qui t'intéresse, lis les détails, puis clique sur « Postuler ». Ton profil sera automatiquement envoyé au recruteur. Tu peux suivre l'état de tes candidatures depuis ton tableau de bord.",
  },
  {
    q: "Comment contacter un recruteur ?",
    a: "Sur la fiche d'une offre ou d'une entreprise, tu trouveras les options de contact disponibles : WhatsApp, appel téléphonique ou email. Le recruteur peut aussi te contacter directement si ton profil correspond à ses recherches.",
  },
  {
    q: "Mon profil est-il gratuit ?",
    a: "Oui, la création et l'utilisation d'un profil talent sont entièrement gratuites. TalentProof croit que chaque travailleur doit avoir accès à la visibilité, sans barrière financière.",
  },
  {
    q: "Comment être vérifié ?",
    a: "Le badge « Vérifié ✓ » est attribué par l'équipe TalentProof après vérification de l'identité et des documents fournis (pièce d'identité, diplôme ou attestation). Contacte-nous via WhatsApp pour lancer le processus de vérification.",
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Pour supprimer ton compte, contacte notre équipe à contact@talentproof.africa ou via WhatsApp avec ta demande. Nous traiterons ta demande dans un délai de 7 jours ouvrables et supprimerons toutes tes données conformément à notre politique de confidentialité.",
  },
];

export default function AidePage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx));

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Annuaire</Link>
            <Link href="/a-propos" className="hover:text-[#1B3A6B] transition-colors">À propos</Link>
            <Link href="/contact" className="hover:text-[#1B3A6B] transition-colors">Contact</Link>
            <Link href="/aide" className="font-semibold transition-colors" style={{ color: NAVY }}>Aide</Link>
          </nav>
          <Link
            href="/inscription?role=talent"
            className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Créer mon profil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-14 text-center" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Nous sommes là pour t&apos;aider
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4" style={{ color: NAVY }}>
              Centre d&apos;aide
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Retrouve les réponses aux questions les plus fréquentes sur TalentProof.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-center" style={{ color: GOLD }}>
              Questions fréquentes
            </p>
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: NAVY }}>
              FAQ
            </h2>

            <div className="flex flex-col gap-3">
              {faqs.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border overflow-hidden transition-all"
                  style={{
                    borderColor: openIdx === idx ? NAVY : "#E5E7EB",
                    background: "#fff",
                  }}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span
                      className="text-sm font-semibold leading-snug"
                      style={{ color: NAVY }}
                    >
                      {item.q}
                    </span>
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold transition-transform"
                      style={{
                        backgroundColor: openIdx === idx ? GOLD : NAVY,
                        transform: openIdx === idx ? "rotate(45deg)" : "none",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openIdx === idx && (
                    <div className="px-6 pb-5 border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed pt-4">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pas trouvé ta réponse ? */}
        <section className="px-4 py-16" style={{ backgroundColor: "#EEF2F9" }}>
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
            <span className="text-5xl">💬</span>
            <h2 className="text-xl font-bold" style={{ color: NAVY }}>
              Tu n&apos;as pas trouvé ta réponse ?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Notre équipe est disponible pour t&apos;aider. Contacte-nous directement via WhatsApp ou par email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/2250507939706"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                💬 WhatsApp
              </a>
              <Link
                href="/contact"
                className="rounded-full px-7 py-3 text-sm font-semibold border-2 transition-colors hover:bg-[#1B3A6B] hover:text-white"
                style={{ borderColor: NAVY, color: NAVY }}
              >
                Formulaire de contact
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
            <p className="text-white/70 text-sm leading-relaxed">
              La plateforme qui prouve que la compétence mérite d&apos;être vue.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Plateforme</p>
            <Link href="/annuaire" className="text-sm text-white/60 hover:text-white transition-colors">Annuaire</Link>
            <Link href="/inscription?role=talent" className="text-sm text-white/60 hover:text-white transition-colors">Créer mon profil</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Je suis…</p>
            <Link href="/inscription?role=talent" className="text-sm text-white/60 hover:text-white transition-colors">Un Talent</Link>
            <Link href="/inscription?role=recruteur" className="text-sm text-white/60 hover:text-white transition-colors">Un Recruteur</Link>
            <Link href="/inscription?role=entreprise" className="text-sm text-white/60 hover:text-white transition-colors">Une Entreprise</Link>
            <Link href="/inscription?role=centre" className="text-sm text-white/60 hover:text-white transition-colors">Un Centre de formation</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">Informations</p>
            <Link href="/a-propos" className="text-sm text-white/60 hover:text-white transition-colors">À propos</Link>
            <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
            <Link href="/aide" className="text-sm text-white/60 hover:text-white transition-colors">Aide</Link>
            <Link href="/conditions-utilisation" className="text-sm text-white/60 hover:text-white transition-colors">Conditions d&apos;utilisation</Link>
            <Link href="/confidentialite" className="text-sm text-white/60 hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
            <span>© 2025 TalentProof Africa. Tous droits réservés.</span>
            <span>Fait avec ❤️ pour l&apos;Afrique</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
