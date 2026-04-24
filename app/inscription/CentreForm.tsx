"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

interface Formation {
  nom: string;
  duree: string;
  prix: string;
  niveau: string;
}

interface FormData {
  // Étape 1
  nom_centre: string;
  pays: string;
  ville: string;
  adresse: string;
  domaine_formation: string;
  logo: File | null;
  pin: string;
  pin_confirm: string;
  // Étape 2
  formations: Formation[];
  mode_formation: string;
  public_cible: string;
  // Étape 3
  description: string;
  mission: string;
  taux_reussite: string;
  telephone: string;
  whatsapp: string;
  email: string;
}

const FORMATION_VIDE: Formation = { nom: "", duree: "", prix: "", niveau: "" };

const INIT: FormData = {
  nom_centre: "", pays: "", ville: "", adresse: "", domaine_formation: "",
  logo: null, pin: "", pin_confirm: "",
  formations: [{ ...FORMATION_VIDE }],
  mode_formation: "présentiel", public_cible: "",
  description: "", mission: "", taux_reussite: "",
  telephone: "", whatsapp: "", email: "",
};

const ETAPES = ["Identité", "Formations", "Présentation"];

const DOMAINES = [
  "Informatique & Numérique", "BTP & Construction", "Électricité & Électronique",
  "Santé & Soins", "Commerce & Gestion", "Agriculture & Agroalimentaire",
  "Couture & Mode", "Coiffure & Esthétique", "Cuisine & Hôtellerie",
  "Mécanique & Auto", "Enseignement & Formation", "Langues & Communication",
  "Arts & Culture", "Sécurité & Défense", "Autre",
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

// ─── Bloc formation ───────────────────────────────────────────────────────────

function FormationRow({ formation, index, onChange, onRemove, canRemove }: {
  formation: Formation; index: number;
  onChange: (i: number, key: keyof Formation, val: string) => void;
  onRemove: (i: number) => void; canRemove: boolean;
}) {
  const ic = "rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]/20 transition w-full";
  const sc = ic + " bg-white";
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wide">Formation {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)}
            className="text-xs text-red-400 hover:text-red-600 font-semibold">Supprimer</button>
        )}
      </div>
      <input className={ic} placeholder="Nom de la formation *" value={formation.nom}
        onChange={(e) => onChange(index, "nom", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className={ic} placeholder="Durée (ex: 3 mois)" value={formation.duree}
          onChange={(e) => onChange(index, "duree", e.target.value)} />
        <input className={ic} placeholder="Prix (ex: 500 000 GNF)" value={formation.prix}
          onChange={(e) => onChange(index, "prix", e.target.value)} />
      </div>
      <select className={sc} value={formation.niveau} onChange={(e) => onChange(index, "niveau", e.target.value)}>
        <option value="">Niveau requis…</option>
        <option>Aucun prérequis</option>
        <option>Niveau primaire</option>
        <option>Niveau collège</option>
        <option>Niveau lycée / Bac</option>
        <option>Bac+2</option>
        <option>Bac+3 et plus</option>
      </select>
    </div>
  );
}

// ─── Formulaire principal ─────────────────────────────────────────────────────

export function CentreForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function updateFormation(i: number, key: keyof Formation, val: string) {
    const updated = form.formations.map((f, idx) => idx === i ? { ...f, [key]: val } : f);
    set("formations", updated);
  }

  function addFormation() {
    set("formations", [...form.formations, { ...FORMATION_VIDE }]);
  }

  function removeFormation(i: number) {
    set("formations", form.formations.filter((_, idx) => idx !== i));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.nom_centre.trim()) errs.nom_centre = "Requis";
      if (!form.pays) errs.pays = "Requis";
      if (!form.ville.trim()) errs.ville = "Requis";
      if (!form.domaine_formation) errs.domaine_formation = "Requis";
      if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) errs.pin = "PIN = 4 chiffres";
      if (form.pin !== form.pin_confirm) errs.pin_confirm = "Les PINs ne correspondent pas";
    }
    if (step === 1) {
      const hasValid = form.formations.some((f) => f.nom.trim());
      if (!hasValid) errs.formations = "Ajoutez au moins une formation";
      if (!form.public_cible.trim()) errs.public_cible = "Requis";
    }
    if (step === 2) {
      if (!form.description.trim()) errs.description = "Requis";
      if (!form.telephone.trim()) errs.telephone = "Requis";
      if (!form.email.trim() || !form.email.includes("@")) errs.email = "Email invalide";
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
          prenom: form.nom_centre.trim(),
          nom: "",
          email: form.email.trim().toLowerCase(),
          telephone: form.telephone.trim(),
          role: "centre_formation",
          pin: form.pin,
        })
        .select("id").single();

      if (userError || !user) { setGlobalError(userError?.message ?? "Erreur création du compte."); setLoading(false); return; }

      const uid = user.id;
      const ts = Date.now();
      const logo_url = form.logo ? await uploadFile(form.logo, "avatars", `${uid}/logo_${ts}`) : null;

      const { error: centreError } = await supabase.from("centres_formation").insert({
        utilisateur_id: uid,
        nom_centre: form.nom_centre.trim(),
        pays: form.pays, ville: form.ville.trim(), adresse: form.adresse.trim(),
        domaine_formation: form.domaine_formation,
        logo_url,
        formations: form.formations.filter((f) => f.nom.trim()),
        mode_formation: form.mode_formation,
        public_cible: form.public_cible.trim(),
        description: form.description.trim(),
        mission: form.mission.trim(),
        taux_reussite: form.taux_reussite.trim(),
        telephone: form.telephone.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
      });

      if (centreError) { setGlobalError(centreError.message); setLoading(false); return; }
      router.push("/profil");
    } catch {
      setGlobalError("Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1" style={{ color: "#1B3A6B" }}>
        Centre de Formation
      </h1>
      <p className="text-center text-gray-500 text-sm mb-8">
        Étape {step + 1} sur {ETAPES.length} — {ETAPES[step]}
      </p>
      <ProgressBar step={step} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {/* ─── ÉTAPE 1 ─── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <Field label="Nom du centre *" error={errors.nom_centre}>
              <input className={inputCls} value={form.nom_centre} onChange={(e) => set("nom_centre", e.target.value)} placeholder="ex: Centre de Formation Avenir" />
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
              <input className={inputCls} value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="ex: Quartier Dixinn, en face du lycée…" />
            </Field>
            <Field label="Domaine de formation principal *" error={errors.domaine_formation}>
              <select className={selectCls} value={form.domaine_formation} onChange={(e) => set("domaine_formation", e.target.value)}>
                <option value="">Choisir…</option>
                {DOMAINES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <FileInput label="Logo du centre" accept="image/*" hint="JPG, PNG — max 5 Mo"
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
            <div className="flex flex-col gap-3">
              {form.formations.map((f, i) => (
                <FormationRow key={i} formation={f} index={i}
                  onChange={updateFormation} onRemove={removeFormation} canRemove={form.formations.length > 1} />
              ))}
              {errors.formations && <span className="text-xs text-red-500">{errors.formations}</span>}
              <button type="button" onClick={addFormation}
                className="rounded-xl border-2 border-dashed border-[#1B3A6B]/40 py-2.5 text-sm font-semibold text-[#1B3A6B] hover:border-[#1B3A6B] hover:bg-[#EEF2F9] transition-colors">
                + Ajouter une formation
              </button>
            </div>

            <Field label="Mode de formation">
              <div className="flex flex-wrap gap-4 mt-1">
                {["présentiel", "distanciel", "mixte"].map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode_formation" value={m}
                      checked={form.mode_formation === m} onChange={() => set("mode_formation", m)}
                      className="accent-[#1B3A6B]" />
                    <span className="text-sm capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Public cible *" error={errors.public_cible}>
              <textarea rows={2} className={textareaCls} value={form.public_cible}
                onChange={(e) => set("public_cible", e.target.value)}
                placeholder="ex: Jeunes sans emploi, femmes, bacheliers, reconversion professionnelle…" />
            </Field>
          </div>
        )}

        {/* ─── ÉTAPE 3 ─── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <Field label="Description du centre *" error={errors.description}>
              <textarea rows={4} className={textareaCls} value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Présentez votre centre, son histoire, ses atouts…" />
            </Field>
            <Field label="Mission">
              <textarea rows={2} className={textareaCls} value={form.mission}
                onChange={(e) => set("mission", e.target.value)}
                placeholder="ex: Former des jeunes qualifiés pour le marché du travail…" />
            </Field>
            <Field label="Taux de réussite / insertion">
              <input className={inputCls} value={form.taux_reussite} onChange={(e) => set("taux_reussite", e.target.value)}
                placeholder="ex: 85% de nos apprenants trouvent un emploi en 3 mois" />
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
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@centre.com" />
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
