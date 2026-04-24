"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

interface FormData {
  // Étape 1
  nom_entreprise: string;
  pays: string;
  ville: string;
  adresse: string;
  secteur: string;
  taille: string;
  site_web: string;
  logo: File | null;
  pin: string;
  pin_confirm: string;
  // Étape 2
  description: string;
  mission: string;
  vision: string;
  valeurs: string;
  annee_creation: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  // Étape 3
  telephone: string;
  whatsapp: string;
  email: string;
  nom_responsable: string;
}

const INIT: FormData = {
  nom_entreprise: "", pays: "", ville: "", adresse: "", secteur: "", taille: "",
  site_web: "", logo: null, pin: "", pin_confirm: "",
  description: "", mission: "", vision: "", valeurs: "", annee_creation: "",
  facebook: "", linkedin: "", instagram: "",
  telephone: "", whatsapp: "", email: "", nom_responsable: "",
};

const ETAPES = ["Identité", "Description", "Contact"];

const SECTEURS = [
  "Agriculture & Élevage", "BTP & Construction", "Commerce & Vente",
  "Communication & Médias", "Droit & Justice", "Éducation & Formation",
  "Finance & Comptabilité", "Hôtellerie & Restauration", "Industrie & Production",
  "Informatique & Tech", "Logistique & Transport", "Santé & Social",
  "Sécurité & Surveillance", "Services aux particuliers", "Autre",
];

const TAILLES = [
  "1–5 employés", "6–20 employés", "21–50 employés",
  "51–200 employés", "201–500 employés", "500+ employés",
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

const inputCls = "rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition";
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
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors text-left">
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
              i < step ? "bg-[#1B3A6B] border-[#1B3A6B] text-white"
              : i === step ? "border-[#1B3A6B] text-[#1B3A6B] bg-white"
              : "border-gray-200 text-gray-400 bg-white"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-[#1B3A6B] font-semibold" : "text-gray-400"}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ backgroundColor: "#1B3A6B", width: `${(step / (ETAPES.length - 1)) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Formulaire principal ─────────────────────────────────────────────────────

export function EntrepriseForm() {
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
      if (!form.nom_entreprise.trim()) errs.nom_entreprise = "Requis";
      if (!form.pays) errs.pays = "Requis";
      if (!form.ville.trim()) errs.ville = "Requis";
      if (!form.secteur) errs.secteur = "Requis";
      if (!form.taille) errs.taille = "Requis";
      if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) errs.pin = "PIN = 4 chiffres";
      if (form.pin !== form.pin_confirm) errs.pin_confirm = "Les PINs ne correspondent pas";
    }
    if (step === 1) {
      if (!form.description.trim()) errs.description = "Requis";
    }
    if (step === 2) {
      if (!form.telephone.trim()) errs.telephone = "Requis";
      if (!form.email.trim() || !form.email.includes("@")) errs.email = "Email invalide";
      if (!form.nom_responsable.trim()) errs.nom_responsable = "Requis";
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
        .insert({
          prenom: form.nom_responsable.split(" ")[0] ?? "",
          nom: form.nom_responsable.split(" ").slice(1).join(" ") ?? "",
          email: form.email.trim().toLowerCase(),
          telephone: form.telephone.trim(),
          role: "entreprise",
          pin: form.pin,
        })
        .select("id").single();

      if (userError || !user) { setGlobalError(userError?.message ?? "Erreur création du compte."); setLoading(false); return; }

      const uid = user.id;
      const ts = Date.now();
      const logo_url = form.logo ? await uploadFile(form.logo, "avatars", `${uid}/logo_${ts}`) : null;

      const { error: entrepriseError } = await supabase.from("entreprises").insert({
        utilisateur_id: uid,
        nom_entreprise: form.nom_entreprise.trim(),
        pays: form.pays, ville: form.ville.trim(), adresse: form.adresse.trim(),
        secteur: form.secteur, taille: form.taille, site_web: form.site_web.trim(),
        logo_url,
        description: form.description.trim(),
        mission: form.mission.trim(), vision: form.vision.trim(), valeurs: form.valeurs.trim(),
        annee_creation: form.annee_creation ? parseInt(form.annee_creation) : null,
        facebook: form.facebook.trim(), linkedin: form.linkedin.trim(), instagram: form.instagram.trim(),
        telephone: form.telephone.trim(), whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        nom_responsable: form.nom_responsable.trim(),
      });

      if (entrepriseError) { setGlobalError(entrepriseError.message); setLoading(false); return; }
      router.push("/profil");
    } catch {
      setGlobalError("Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1" style={{ color: "#1B3A6B" }}>
        Espace Entreprise
      </h1>
      <p className="text-center text-gray-500 text-sm mb-8">
        Étape {step + 1} sur {ETAPES.length} — {ETAPES[step]}
      </p>
      <ProgressBar step={step} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {/* ─── ÉTAPE 1 ─── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <Field label="Nom de l'entreprise *" error={errors.nom_entreprise}>
              <input className={inputCls} value={form.nom_entreprise} onChange={(e) => set("nom_entreprise", e.target.value)} placeholder="ex: SARL Construction Avenir" />
            </Field>
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
            <Field label="Adresse">
              <input className={inputCls} value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="ex: Quartier Matam, Commune de Matam" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Secteur d'activité *" error={errors.secteur}>
                <select className={selectCls} value={form.secteur} onChange={(e) => set("secteur", e.target.value)}>
                  <option value="">Choisir…</option>
                  {SECTEURS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Taille de l'entreprise *" error={errors.taille}>
                <select className={selectCls} value={form.taille} onChange={(e) => set("taille", e.target.value)}>
                  <option value="">Choisir…</option>
                  {TAILLES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Site web">
              <input type="url" className={inputCls} value={form.site_web} onChange={(e) => set("site_web", e.target.value)} placeholder="https://…" />
            </Field>
            <FileInput label="Logo de l'entreprise" accept="image/*" hint="JPG, PNG — max 5 Mo"
              value={form.logo} onChange={(f) => set("logo", f)} />
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
          </div>
        )}

        {/* ─── ÉTAPE 2 ─── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <Field label="Description de l'entreprise *" error={errors.description}>
              <textarea rows={4} className={textareaCls} value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Présentez votre entreprise, son histoire, ses activités…" />
            </Field>
            <Field label="Mission">
              <textarea rows={2} className={textareaCls} value={form.mission}
                onChange={(e) => set("mission", e.target.value)} placeholder="ex: Construire des logements de qualité accessibles à tous…" />
            </Field>
            <Field label="Vision">
              <textarea rows={2} className={textareaCls} value={form.vision}
                onChange={(e) => set("vision", e.target.value)} placeholder="ex: Devenir le leader du BTP en Afrique de l'Ouest…" />
            </Field>
            <Field label="Valeurs">
              <textarea rows={2} className={textareaCls} value={form.valeurs}
                onChange={(e) => set("valeurs", e.target.value)} placeholder="ex: Intégrité, Innovation, Excellence…" />
            </Field>
            <Field label="Année de création">
              <input type="number" min="1900" max={new Date().getFullYear()} className={inputCls}
                value={form.annee_creation} onChange={(e) => set("annee_creation", e.target.value)} placeholder="ex: 2015" />
            </Field>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-gray-700">Réseaux sociaux</span>
              <input className={inputCls} value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="Facebook — https://facebook.com/…" />
              <input className={inputCls} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="LinkedIn — https://linkedin.com/…" />
              <input className={inputCls} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Instagram — https://instagram.com/…" />
            </div>
          </div>
        )}

        {/* ─── ÉTAPE 3 ─── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <Field label="Nom du responsable *" error={errors.nom_responsable}>
              <input className={inputCls} value={form.nom_responsable} onChange={(e) => set("nom_responsable", e.target.value)} placeholder="ex: Mariama Camara" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Téléphone *" error={errors.telephone}>
                <input type="tel" className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+224 6XX XXX XXX" />
              </Field>
              <Field label="WhatsApp">
                <input type="tel" className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+224 6XX XXX XXX" />
              </Field>
            </div>
            <Field label="Email *" error={errors.email}>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@entreprise.com" />
            </Field>
            {globalError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{globalError}</div>
            )}
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className={`flex mt-8 gap-3 ${step > 0 ? "justify-between" : "justify-end"}`}>
          {step > 0 && (
            <button type="button" onClick={prev}
              className="rounded-full border-2 border-[#1B3A6B] px-6 py-2.5 text-sm font-semibold text-[#1B3A6B] hover:bg-[#EEF2F9] transition-colors">
              ← Précédent
            </button>
          )}
          {step < ETAPES.length - 1 ? (
            <button type="button" onClick={next}
              className="rounded-full px-8 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#C9A84C" }}>
              Suivant →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="rounded-full px-8 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              style={{ backgroundColor: "#C9A84C" }}>
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
