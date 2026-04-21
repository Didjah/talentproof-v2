"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

interface FormData {
  // Étape 1
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  pays: string;
  ville: string;
  site_web: string;
  type_recruteur: string;
  pin: string;
  pin_confirm: string;
  logo: File | null;
  // Étape 2
  poste_recherche: string;
  nombre_personnes: string;
  competences_attendues: string;
  niveau_recherche: string;
  annees_experience_souhaitees: string;
  salaire_propose: string;
  type_contrat: string;
  date_debut: string;
  // Étape 3
  description: string;
  secteur: string;
  objectif_recrutement: string;
  avantages: string;
  whatsapp: string;
  email_contact: string;
}

const INIT: FormData = {
  prenom: "", nom: "", telephone: "", email: "", pays: "", ville: "",
  site_web: "", type_recruteur: "indépendant", pin: "", pin_confirm: "",
  logo: null,
  poste_recherche: "", nombre_personnes: "1", competences_attendues: "",
  niveau_recherche: "", annees_experience_souhaitees: "", salaire_propose: "",
  type_contrat: "", date_debut: "",
  description: "", secteur: "", objectif_recrutement: "", avantages: "",
  whatsapp: "", email_contact: "",
};

const ETAPES = ["Informations", "Besoins", "Présentation"];

const SECTEURS = [
  "Agriculture & Élevage", "BTP & Construction", "Commerce & Vente",
  "Communication & Médias", "Droit & Justice", "Éducation & Formation",
  "Finance & Comptabilité", "Hôtellerie & Restauration", "Industrie & Production",
  "Informatique & Tech", "Logistique & Transport", "Santé & Social",
  "Sécurité & Surveillance", "Services aux particuliers", "Autre",
];

const CONTRATS = [
  "CDI", "CDD", "Freelance / Auto-entrepreneur", "Mission ponctuelle",
  "Stage", "Alternance", "Peu importe",
];

const PAYS = [
  "Guinée", "Sénégal", "Mali", "Côte d'Ivoire", "Burkina Faso",
  "Cameroun", "Togo", "Bénin", "Niger", "Mauritanie",
  "France", "Belgique", "Canada", "Maroc", "Autre",
];

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const inputCls = "rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a5c3a] focus:ring-2 focus:ring-[#1a5c3a]/20 transition";
const selectCls = inputCls + " bg-white";
const textareaCls = inputCls + " resize-none";

function FileInput({ label, accept, hint, onChange, value }: {
  label: string; accept: string; hint?: string; onChange: (f: File | null) => void; value: File | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <button type="button" onClick={() => ref.current?.click()}
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-[#1a5c3a] hover:text-[#1a5c3a] transition-colors text-left">
        <span className="text-2xl">📎</span>
        <span className="flex-1 truncate">{value ? value.name : "Choisir un fichier…"}</span>
        {value && (
          <span className="text-red-400 hover:text-red-600 font-bold"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ""; }}>✕</span>
        )}
      </button>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {ETAPES.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < step ? "bg-[#1a5c3a] border-[#1a5c3a] text-white"
              : i === step ? "border-[#1a5c3a] text-[#1a5c3a] bg-white"
              : "border-gray-200 text-gray-400 bg-white"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-[#1a5c3a] font-semibold" : "text-gray-400"}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ backgroundColor: "#1a5c3a", width: `${(step / (ETAPES.length - 1)) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Formulaire principal ─────────────────────────────────────────────────────

export function RecruteurForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.prenom.trim()) errs.prenom = "Requis";
      if (!form.nom.trim()) errs.nom = "Requis";
      if (!form.telephone.trim()) errs.telephone = "Requis";
      if (!form.email.trim() || !form.email.includes("@")) errs.email = "Email invalide";
      if (!form.pays) errs.pays = "Requis";
      if (!form.ville.trim()) errs.ville = "Requis";
      if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) errs.pin = "PIN = 4 chiffres";
      if (form.pin !== form.pin_confirm) errs.pin_confirm = "Les PINs ne correspondent pas";
    }
    if (step === 1) {
      if (!form.poste_recherche.trim()) errs.poste_recherche = "Requis";
      if (!form.competences_attendues.trim()) errs.competences_attendues = "Requis";
      if (!form.niveau_recherche) errs.niveau_recherche = "Requis";
      if (!form.type_contrat) errs.type_contrat = "Requis";
    }
    if (step === 2) {
      if (!form.description.trim()) errs.description = "Requis";
      if (!form.secteur) errs.secteur = "Requis";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() { if (validate()) setStep((s) => s + 1); }
  function prev() { setStep((s) => s - 1); }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setGlobalError("");
    try {
      const { data: user, error: userError } = await supabase
        .from("utilisateurs")
        .insert({ prenom: form.prenom.trim(), nom: form.nom.trim(), email: form.email.trim().toLowerCase(), telephone: form.telephone.trim(), role: "recruteur", pin: form.pin })
        .select("id").single();

      if (userError || !user) { setGlobalError(userError?.message ?? "Erreur création du compte."); setLoading(false); return; }

      const uid = user.id;
      const ts = Date.now();
      const logo_url = form.logo ? await uploadFile(form.logo, "avatars", `${uid}/logo_${ts}`) : null;

      const { error: recruteurError } = await supabase.from("recruteurs").insert({
        utilisateur_id: uid,
        pays: form.pays, ville: form.ville.trim(), site_web: form.site_web.trim(),
        type_recruteur: form.type_recruteur,
        poste_recherche: form.poste_recherche.trim(),
        nombre_personnes: parseInt(form.nombre_personnes) || 1,
        competences_attendues: form.competences_attendues.trim(),
        niveau_recherche: form.niveau_recherche,
        annees_experience_souhaitees: form.annees_experience_souhaitees ? parseInt(form.annees_experience_souhaitees) : null,
        salaire_propose: form.salaire_propose.trim(),
        type_contrat: form.type_contrat,
        date_debut: form.date_debut || null,
        description: form.description.trim(),
        secteur: form.secteur,
        objectif_recrutement: form.objectif_recrutement.trim(),
        avantages: form.avantages.trim(),
        whatsapp: form.whatsapp.trim(),
        email_contact: form.email_contact.trim() || form.email.trim(),
        logo_url,
      });

      if (recruteurError) { setGlobalError(recruteurError.message); setLoading(false); return; }
      router.push("/profil");
    } catch {
      setGlobalError("Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1" style={{ color: "#1a5c3a" }}>
        Espace Recruteur
      </h1>
      <p className="text-center text-gray-500 text-sm mb-8">
        Étape {step + 1} sur {ETAPES.length} — {ETAPES[step]}
      </p>
      <ProgressBar step={step} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {/* ─── ÉTAPE 1 ─── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Prénom *" error={errors.prenom}>
                <input className={inputCls} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="ex: Ibrahima" />
              </Field>
              <Field label="Nom *" error={errors.nom}>
                <input className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="ex: Barry" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Téléphone *" error={errors.telephone}>
                <input type="tel" className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+224 6XX XXX XXX" />
              </Field>
              <Field label="Email *" error={errors.email}>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="exemple@mail.com" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Pays *" error={errors.pays}>
                <select className={selectCls} value={form.pays} onChange={(e) => set("pays", e.target.value)}>
                  <option value="">Choisir…</option>
                  {PAYS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Ville *" error={errors.ville}>
                <input className={inputCls} value={form.ville} onChange={(e) => set("ville", e.target.value)} placeholder="ex: Conakry" />
              </Field>
            </div>
            <Field label="Site web">
              <input type="url" className={inputCls} value={form.site_web} onChange={(e) => set("site_web", e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Type de recruteur">
              <div className="flex gap-6 mt-1">
                {["indépendant", "entreprise"].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type_recruteur" value={t} checked={form.type_recruteur === t}
                      onChange={() => set("type_recruteur", t)} className="accent-[#1a5c3a]" />
                    <span className="text-sm capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Code PIN (4 chiffres) *" error={errors.pin}>
                <input type="password" inputMode="numeric" maxLength={4} className={inputCls}
                  value={form.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" />
              </Field>
              <Field label="Confirmer le PIN *" error={errors.pin_confirm}>
                <input type="password" inputMode="numeric" maxLength={4} className={inputCls}
                  value={form.pin_confirm} onChange={(e) => set("pin_confirm", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" />
              </Field>
            </div>
            <FileInput label="Photo / Logo (optionnel)" accept="image/*" hint="JPG, PNG — max 5 Mo"
              value={form.logo} onChange={(f) => set("logo", f)} />
          </div>
        )}

        {/* ─── ÉTAPE 2 ─── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <Field label="Poste recherché *" error={errors.poste_recherche}>
              <input className={inputCls} value={form.poste_recherche} onChange={(e) => set("poste_recherche", e.target.value)} placeholder="ex: Électricien industriel" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Nombre de personnes">
                <input type="number" min="1" className={inputCls} value={form.nombre_personnes}
                  onChange={(e) => set("nombre_personnes", e.target.value)} placeholder="1" />
              </Field>
              <Field label="Niveau recherché *" error={errors.niveau_recherche}>
                <select className={selectCls} value={form.niveau_recherche} onChange={(e) => set("niveau_recherche", e.target.value)}>
                  <option value="">Choisir…</option>
                  <option>Débutant (0–1 an)</option>
                  <option>Junior (1–3 ans)</option>
                  <option>Intermédiaire (3–5 ans)</option>
                  <option>Senior (5–10 ans)</option>
                  <option>Expert (10 ans+)</option>
                </select>
              </Field>
            </div>
            <Field label="Compétences attendues *" error={errors.competences_attendues}>
              <textarea rows={3} className={textareaCls} value={form.competences_attendues}
                onChange={(e) => set("competences_attendues", e.target.value)}
                placeholder="ex: Soudure MIG, lecture de plans, autonomie…" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Années d'expérience souhaitées">
                <input type="number" min="0" className={inputCls} value={form.annees_experience_souhaitees}
                  onChange={(e) => set("annees_experience_souhaitees", e.target.value)} placeholder="ex: 3" />
              </Field>
              <Field label="Salaire proposé">
                <input className={inputCls} value={form.salaire_propose} onChange={(e) => set("salaire_propose", e.target.value)}
                  placeholder="ex: 3 000 000 GNF / mois" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Type de contrat *" error={errors.type_contrat}>
                <select className={selectCls} value={form.type_contrat} onChange={(e) => set("type_contrat", e.target.value)}>
                  <option value="">Choisir…</option>
                  {CONTRATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Date de début souhaitée">
                <input type="date" className={inputCls} value={form.date_debut} onChange={(e) => set("date_debut", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ─── ÉTAPE 3 ─── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <Field label="Description *" error={errors.description}>
              <textarea rows={3} className={textareaCls} value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Présentez-vous ou présentez votre structure…" />
            </Field>
            <Field label="Secteur d'activité *" error={errors.secteur}>
              <select className={selectCls} value={form.secteur} onChange={(e) => set("secteur", e.target.value)}>
                <option value="">Choisir…</option>
                {SECTEURS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Objectif de recrutement">
              <textarea rows={2} className={textareaCls} value={form.objectif_recrutement}
                onChange={(e) => set("objectif_recrutement", e.target.value)}
                placeholder="ex: Renforcer l'équipe technique pour un projet de 6 mois…" />
            </Field>
            <Field label="Avantages proposés">
              <textarea rows={2} className={textareaCls} value={form.avantages}
                onChange={(e) => set("avantages", e.target.value)}
                placeholder="ex: Transport, repas, prime de rendement…" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="WhatsApp">
                <input type="tel" className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+224 6XX XXX XXX" />
              </Field>
              <Field label="Email de contact">
                <input type="email" className={inputCls} value={form.email_contact} onChange={(e) => set("email_contact", e.target.value)} placeholder="contact@…" />
              </Field>
            </div>
            {globalError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{globalError}</div>
            )}
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className={`flex mt-8 gap-3 ${step > 0 ? "justify-between" : "justify-end"}`}>
          {step > 0 && (
            <button type="button" onClick={prev}
              className="rounded-full border-2 border-[#1a5c3a] px-6 py-2.5 text-sm font-semibold text-[#1a5c3a] hover:bg-[#f0f7f3] transition-colors">
              ← Précédent
            </button>
          )}
          {step < ETAPES.length - 1 ? (
            <button type="button" onClick={next}
              className="rounded-full px-8 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#1a5c3a" }}>
              Suivant →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="rounded-full px-8 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              style={{ backgroundColor: "#1a5c3a" }}>
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? "Création en cours…" : "Créer mon compte"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
