"use client";

import { useState } from "react";
import Link from "next/link";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

export default function ContactPage() {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.nom.trim()) e.nom = "Champ requis";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Message trop court";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSent(true);
  };

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
            <Link href="/contact" className="font-semibold transition-colors" style={{ color: NAVY }}>Contact</Link>
            <Link href="/aide" className="hover:text-[#1B3A6B] transition-colors">Aide</Link>
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
              On est là pour toi
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4" style={{ color: NAVY }}>
              Nous contacter
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Une question, un problème ou une suggestion ? Écris-nous, on te répond rapidement.
            </p>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            {/* Coordonnées */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
                  Nos coordonnées
                </p>
                <div className="flex flex-col gap-4">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/2250507939706"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl p-5 border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      💬
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">WhatsApp</p>
                      <p className="text-base font-semibold" style={{ color: NAVY }}>+225 05 07 93 97 06</p>
                      <p className="text-xs text-gray-500 mt-0.5">Réponse en moins de 24h</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:contact@talentproof.africa"
                    className="flex items-center gap-4 rounded-2xl p-5 border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: "#EEF2F9" }}
                    >
                      📧
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Email</p>
                      <p className="text-base font-semibold" style={{ color: NAVY }}>contact@talentproof.africa</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pour les demandes détaillées</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
                  Nos réseaux sociaux
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Facebook", emoji: "📘", href: "#" },
                    { label: "LinkedIn", emoji: "💼", href: "#" },
                    { label: "Instagram", emoji: "📸", href: "#" },
                    { label: "Twitter / X", emoji: "🐦", href: "#" },
                  ].map(({ label, emoji, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all hover:shadow-sm"
                      style={{ borderColor: NAVY, color: NAVY }}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
                <p className="text-sm font-bold mb-3" style={{ color: NAVY }}>🕐 Disponibilité</p>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Lundi – Vendredi</span>
                    <span className="font-semibold text-gray-800">08h – 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-semibold text-gray-800">09h – 13h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="font-medium text-gray-400">Fermé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
                Formulaire de contact
              </p>
              {sent ? (
                <div className="rounded-3xl p-10 text-center border border-green-100 bg-green-50 flex flex-col items-center gap-4">
                  <span className="text-5xl">✅</span>
                  <h3 className="text-xl font-bold text-green-800">Message envoyé !</h3>
                  <p className="text-green-700 text-sm leading-relaxed">
                    Merci de nous avoir contactés. Notre équipe te répondra dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ nom: "", email: "", message: "" }); }}
                    className="mt-2 rounded-full px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: NAVY }}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: NAVY }}>
                      Nom complet <span style={{ color: GOLD }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                      placeholder="Ex : Kofi Mensah"
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
                        errors.nom ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#1B3A6B]"
                      }`}
                    />
                    {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: NAVY }}>
                      Adresse email <span style={{ color: GOLD }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="Ex : kofi@email.com"
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
                        errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#1B3A6B]"
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: NAVY }}>
                      Message <span style={{ color: GOLD }}>*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Décris ta demande, ton problème ou ta suggestion…"
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-colors ${
                        errors.message ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#1B3A6B]"
                      }`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: NAVY }}
                  >
                    Envoyer le message →
                  </button>
                </form>
              )}
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
