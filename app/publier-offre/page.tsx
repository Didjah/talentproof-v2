"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

interface Session {
  utilisateur_id: string;
  role: "recruteur" | "entreprise";
}

const NIVEAUX = ["Débutant", "Intermédiaire", "Expert"];
const CONTRATS = ["CDI", "CDD", "Freelance", "Stage", "Temps partiel"];
const ANNEES   = ["Peu importe", "1 an", "2 ans", "3 ans", "5 ans", "10 ans+"];
const STATUTS  = [
  { value: "ouverte",  label: "Ouverte — candidatures acceptées" },
  { value: "en_cours", label: "En cours — traitement en cours" },
];

const EMPTY = {
  titre: "",
  description: "",
  competences_requises: "",
  niveau_experience: "Débutant",
  annees_experience: "Peu importe",
  salaire_propose: "",
  type_contrat: "CDI",
  ville: "",
  pays: "",
  date_debut: "",
  statut: "ouverte",
};

export default function PublierOffrePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rawR = localStorage.getItem("tp_recruteur");
    const rawE = localStorage.getItem("tp_entreprise");

    if (rawR) {
      try {
        const s = JSON.parse(rawR);
        if (s.utilisateur_id) { setSession({ utilisateur_id: s.utilisateur_id, role: "recruteur" }); return; }
      } catch { /* ignore */ }
    }
    if (rawE) {
      try {
        const s = JSON.parse(rawE);
        if (s.utilisateur_id) { setSession({ utilisateur_id: s.utilisateur_id, role: "entreprise" }); return; }
      } catch { /* ignore */ }
    }
    router.replace("/espace-recruteur");
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setError("");
    setSaving(true);

    const payload: Record<string, unknown> = {
      titre: form.titre.trim(),
      description: form.description.trim(),
      competences_requises: form.competences_requises.trim(),
      niveau_experience: form.niveau_experience,
      annees_experience: form.annees_experience,
      salaire_propose: form.salaire_propose.trim(),
      type_contrat: form.type_contrat,
      ville: form.ville.trim(),
      pays: form.pays.trim(),
      date_debut: form.date_debut || null,
      statut: form.statut,
    };

    if (session.role === "recruteur") {
      payload.recruteur_utilisateur_id = session.utilisateur_id;
    } else {
      payload.entreprise_utilisateur_id = session.utilisateur_id;
    }

    const { error: dbError } = await supabase.from("offres_emploi").insert(payload);
    setSaving(false);

    if (dbError) {
      setError("Erreur lors de la publication : " + dbError.message);
      return;
    }

    router.push(session.role === "recruteur" ? "/espace-recruteur" : "/espace-entreprise");
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
          <Link
            href={session.role === "recruteur" ? "/espace-recruteur" : "/espace-entreprise"}
            className="text-xs font-semibold text-gray-500 hover:text-[#1B3A6B] transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: NAVY }}>Publier une offre d&apos;emploi</h1>
          <p className="text-sm text-gray-500 mt-1">Remplissez les informations ci-dessous pour mettre votre offre en ligne.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Titre */}
          <Field label="Titre du poste *">
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex: Maçon expérimenté, Comptable CDI, Chauffeur livreur…"
              required
              className={INPUT}
            />
          </Field>

          {/* Description */}
          <Field label="Description détaillée *">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Décrivez le poste, les missions, le contexte de travail…"
              required
              className={INPUT}
            />
          </Field>

          {/* Compétences requises */}
          <Field label="Compétences requises">
            <textarea
              name="competences_requises"
              value={form.competences_requises}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: Maîtrise Excel, Permis B, Notions en électricité…"
              className={INPUT}
            />
          </Field>

          {/* Niveau + Années */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Niveau d'expérience">
              <select name="niveau_experience" value={form.niveau_experience} onChange={handleChange} className={INPUT}>
                {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Années d'expérience souhaitées">
              <select name="annees_experience" value={form.annees_experience} onChange={handleChange} className={INPUT}>
                {ANNEES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </Field>
          </div>

          {/* Type contrat + Salaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type de contrat">
              <select name="type_contrat" value={form.type_contrat} onChange={handleChange} className={INPUT}>
                {CONTRATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Salaire proposé">
              <input
                name="salaire_propose"
                value={form.salaire_propose}
                onChange={handleChange}
                placeholder="Ex: 2 500 000 GNF / mois"
                className={INPUT}
              />
            </Field>
          </div>

          {/* Ville + Pays */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ville *">
              <input name="ville" value={form.ville} onChange={handleChange} placeholder="Ex: Conakry" required className={INPUT} />
            </Field>
            <Field label="Pays">
              <input name="pays" value={form.pays} onChange={handleChange} placeholder="Ex: Guinée" className={INPUT} />
            </Field>
          </div>

          {/* Date de début */}
          <Field label="Date de début souhaitée">
            <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} className={INPUT} />
          </Field>

          {/* Statut */}
          <Field label="Statut de l'offre">
            <div className="flex flex-col gap-2">
              {STATUTS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="statut"
                    value={value}
                    checked={form.statut === value}
                    onChange={handleChange}
                    className="accent-[#1B3A6B] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </Field>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: NAVY }}
            >
              {saving ? "Publication en cours…" : "📢 Publier l'offre"}
            </button>
            <Link
              href={session.role === "recruteur" ? "/espace-recruteur" : "/espace-entreprise"}
              className="rounded-full border-2 px-6 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              Annuler
            </Link>
          </div>
        </form>
      </main>

      <footer className="py-6 text-center text-sm text-white/60" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}

const INPUT = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#1B3A6B] bg-white resize-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}
