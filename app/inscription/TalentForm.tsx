"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Étape 1
  prenom: string;
  nom: string;
  genre: string;
  date_naissance: string;
  pays: string;
  ville: string;
  telephone: string;
  email: string;
  langues: string;
  pin: string;
  pin_confirm: string;
  // Étape 2
  metier_principal: string;
  second_metier: string;
  secteur: string;
  niveau_experience: string;
  annees_experience: string;
  disponibilite: string;
  type_contrat: string;
  salaire_souhaite: string;
  // Étape 3
  competences_principales: string;
  competences_secondaires: string;
  outils: string;
  titre_profil: string;
  description_courte: string;
  bio: string;
  // Étape 4 — fichiers
  avatar: File | null;
  video: File | null;
  preuve: File | null;
  cv: File | null;
  diplome: File | null;
  // Étape 5
  whatsapp: string;
  appel_autorise: boolean;
  profil_public: boolean;
  afficher_salaire: boolean;
  afficher_telephone: boolean;
}

const INIT: FormData = {
  prenom: "", nom: "", genre: "", date_naissance: "", pays: "", ville: "",
  telephone: "", email: "", langues: "", pin: "", pin_confirm: "",
  metier_principal: "", second_metier: "", secteur: "", niveau_experience: "",
  annees_experience: "", disponibilite: "immédiate", type_contrat: "", salaire_souhaite: "",
  competences_principales: "", competences_secondaires: "", outils: "",
  titre_profil: "", description_courte: "", bio: "",
  avatar: null, video: null, preuve: null, cv: null, diplome: null,
  whatsapp: "", appel_autorise: true, profil_public: true,
  afficher_salaire: false, afficher_telephone: false,
};

// ─── Données ──────────────────────────────────────────────────────────────────

const METIERS = [
  "Agent administratif", "Agent de nettoyage", "Agent de sécurité / Gardien",
  "Agent immobilier", "Agriculteur", "Aide-ménagère / Ménagère",
  "Architecte", "Artisan", "Assistant(e) comptable",
  "Assistant(e) de direction", "Carreleur", "Chauffeur",
  "Chauffeur-livreur", "Chef cuisinier", "Climaticien / Technicien HVAC",
  "Coiffeur / Coiffeuse", "Commercial / Vendeur", "Comptable",
  "Couturier / Tailleur", "Développeur web / mobile", "Électricien",
  "Enseignant / Formateur", "Esthéticien(ne)", "Gardien(ne) d'enfants",
  "Graphiste / Designer", "Infirmier / Infirmière", "Informaticien",
  "Ingénieur", "Journaliste / Rédacteur", "Juriste / Avocat",
  "Maçon", "Mécanicien", "Menuisier",
  "Peintre en bâtiment", "Photographe / Vidéaste", "Plombier",
  "Secrétaire", "Serveur / Serveuse", "Soudeur",
  "Technicien électronique", "Autre",
];

const SECTEURS = [
  "Agriculture & Élevage", "BTP & Construction", "Commerce & Vente",
  "Communication & Médias", "Droit & Justice", "Éducation & Formation",
  "Finance & Comptabilité", "Hôtellerie & Restauration", "Industrie & Production",
  "Informatique & Tech", "Logistique & Transport", "Santé & Social",
  "Sécurité & Surveillance", "Services aux particuliers", "Autre",
];

const CONTRATS = [
  "CDI", "CDD", "Freelance / Auto-entrepreneur", "Mission ponctuelle",
  "Stage", "Alternance", "Bénévolat", "Peu importe",
];

const PAYS = [
  "Guinée", "Sénégal", "Mali", "Côte d'Ivoire", "Burkina Faso",
  "Cameroun", "Togo", "Bénin", "Niger", "Mauritanie",
  "France", "Belgique", "Canada", "Maroc", "Autre",
];

const ETAPES = [
  "Informations", "Profil pro", "Compétences", "Documents", "Contact",
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

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#1B3A6B]" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function FileInput({
  label, accept, hint, onChange, value,
}: {
  label: string; accept: string; hint?: string; onChange: (f: File | null) => void; value: File | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors text-left"
      >
        <span className="text-2xl">📎</span>
        <span className="flex-1 truncate">{value ? value.name : "Choisir un fichier…"}</span>
        {value && (
          <span
            className="text-red-400 hover:text-red-600 font-bold"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ""; }}
          >✕</span>
        )}
      </button>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

// ─── Barre de progression ─────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {ETAPES.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? "bg-[#1B3A6B] border-[#1B3A6B] text-white"
                : i === step ? "border-[#1B3A6B] text-[#1B3A6B] bg-white"
                : "border-gray-200 text-gray-400 bg-white"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-[#1B3A6B] font-semibold" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ backgroundColor: "#1B3A6B", width: `${((step) / (ETAPES.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Formulaire principal ─────────────────────────────────────────────────────

export function TalentForm() {
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

  // ── Validation par étape ──────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.prenom.trim()) errs.prenom = "Requis";
      if (!form.nom.trim()) errs.nom = "Requis";
      if (!form.genre) errs.genre = "Requis";
      if (!form.date_naissance) errs.date_naissance = "Requis";
      if (!form.pays) errs.pays = "Requis";
      if (!form.ville.trim()) errs.ville = "Requis";
      if (!form.telephone.trim()) errs.telephone = "Requis";
      if (!form.email.trim() || !form.email.includes("@")) errs.email = "Email invalide";
      if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) errs.pin = "PIN = 4 chiffres";
      if (form.pin !== form.pin_confirm) errs.pin_confirm = "Les PINs ne correspondent pas";
    }
    if (step === 1) {
      if (!form.metier_principal) errs.metier_principal = "Requis";
      if (!form.secteur) errs.secteur = "Requis";
      if (!form.niveau_experience) errs.niveau_experience = "Requis";
      if (!form.type_contrat) errs.type_contrat = "Requis";
    }
    if (step === 2) {
      if (!form.competences_principales.trim()) errs.competences_principales = "Requis";
      if (!form.titre_profil.trim()) errs.titre_profil = "Requis";
      if (!form.description_courte.trim()) errs.description_courte = "Requis";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => s + 1);
  }

  function prev() {
    setStep((s) => s - 1);
  }

  // ── Upload fichier ────────────────────────────────────────────────────────

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  // ── Soumission ────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setGlobalError("");

    try {
      // 1. Créer l'utilisateur
      const { data: user, error: userError } = await supabase
        .from("utilisateurs")
        .insert({
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim().toLowerCase(),
          telephone: form.telephone.trim(),
          role: "talent",
          pin: form.pin,
        })
        .select("id")
        .single();

      if (userError || !user) {
        setGlobalError(userError?.message ?? "Erreur lors de la création du compte.");
        setLoading(false);
        return;
      }

      const uid = user.id;
      const ts = Date.now();

      // 2. Upload des fichiers en parallèle
      const [avatar_url, video_url, preuve_url, cv_url, diplome_url] = await Promise.all([
        form.avatar ? uploadFile(form.avatar, "avatars", `${uid}/avatar_${ts}`) : Promise.resolve(null),
        form.video ? uploadFile(form.video, "videos", `${uid}/video_${ts}`) : Promise.resolve(null),
        form.preuve ? uploadFile(form.preuve, "preuves", `${uid}/preuve_${ts}`) : Promise.resolve(null),
        form.cv ? uploadFile(form.cv, "documents", `${uid}/cv_${ts}`) : Promise.resolve(null),
        form.diplome ? uploadFile(form.diplome, "documents", `${uid}/diplome_${ts}`) : Promise.resolve(null),
      ]);

      // 3. Créer le profil talent
      const { error: talentError } = await supabase.from("talents").insert({
        utilisateur_id: uid,
        genre: form.genre,
        date_naissance: form.date_naissance || null,
        pays: form.pays,
        ville: form.ville.trim(),
        langues: form.langues.trim(),
        metier_principal: form.metier_principal,
        second_metier: form.second_metier.trim(),
        secteur: form.secteur,
        niveau_experience: form.niveau_experience,
        annees_experience: form.annees_experience ? parseInt(form.annees_experience) : null,
        disponibilite: form.disponibilite,
        type_contrat: form.type_contrat,
        salaire_souhaite: form.salaire_souhaite.trim(),
        competences_principales: form.competences_principales.trim(),
        competences_secondaires: form.competences_secondaires.trim(),
        outils: form.outils.trim(),
        titre_profil: form.titre_profil.trim(),
        description_courte: form.description_courte.trim(),
        bio: form.bio.trim(),
        avatar_url,
        video_url,
        preuve_url,
        cv_url,
        diplome_url,
        whatsapp: form.whatsapp.trim(),
        appel_autorise: form.appel_autorise,
        profil_public: form.profil_public,
        afficher_salaire: form.afficher_salaire,
        afficher_telephone: form.afficher_telephone,
      });

      if (talentError) {
        setGlobalError(talentError.message);
        setLoading(false);
        return;
      }

      router.push("/profil");
    } catch {
      setGlobalError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      setLoading(false);
    }
  }

  // ─── Rendu des étapes ─────────────────────────────────────────────────────

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1" style={{ color: "#1B3A6B" }}>
        Créer mon profil Talent
      </h1>
      <p className="text-center text-gray-500 text-sm mb-8">
        Étape {step + 1} sur {ETAPES.length} — {ETAPES[step]}
      </p>

      <ProgressBar step={step} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

        {/* ─── ÉTAPE 1 : Infos de base ─── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Prénom *" error={errors.prenom}>
                <input className={inputCls} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="ex: Mamadou" />
              </Field>
              <Field label="Nom *" error={errors.nom}>
                <input className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="ex: Diallo" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Genre *" error={errors.genre}>
                <select className={selectCls} value={form.genre} onChange={(e) => set("genre", e.target.value)}>
                  <option value="">Choisir…</option>
                  <option>Homme</option>
                  <option>Femme</option>
                  <option>Non précisé</option>
                </select>
              </Field>
              <Field label="Date de naissance *" error={errors.date_naissance}>
                <input type="date" className={inputCls} value={form.date_naissance} onChange={(e) => set("date_naissance", e.target.value)} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Téléphone *" error={errors.telephone}>
                <input type="tel" className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+224 6XX XXX XXX" />
              </Field>
              <Field label="Email *" error={errors.email}>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="exemple@mail.com" />
              </Field>
            </div>
            <Field label="Langues parlées">
              <input className={inputCls} value={form.langues} onChange={(e) => set("langues", e.target.value)} placeholder="ex: Français, Peul, Soussou" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Code PIN (4 chiffres) *" error={errors.pin}>
                <input
                  type="password" inputMode="numeric" maxLength={4} className={inputCls}
                  value={form.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                />
              </Field>
              <Field label="Confirmer le PIN *" error={errors.pin_confirm}>
                <input
                  type="password" inputMode="numeric" maxLength={4} className={inputCls}
                  value={form.pin_confirm} onChange={(e) => set("pin_confirm", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                />
              </Field>
            </div>
          </div>
        )}

        {/* ─── ÉTAPE 2 : Profil pro ─── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <Field label="Métier principal *" error={errors.metier_principal}>
              <select className={selectCls} value={form.metier_principal} onChange={(e) => set("metier_principal", e.target.value)}>
                <option value="">Choisir…</option>
                {METIERS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Second métier (optionnel)">
              <input className={inputCls} value={form.second_metier} onChange={(e) => set("second_metier", e.target.value)} placeholder="ex: Photographe" />
            </Field>
            <Field label="Secteur d'activité *" error={errors.secteur}>
              <select className={selectCls} value={form.secteur} onChange={(e) => set("secteur", e.target.value)}>
                <option value="">Choisir…</option>
                {SECTEURS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Niveau d'expérience *" error={errors.niveau_experience}>
                <select className={selectCls} value={form.niveau_experience} onChange={(e) => set("niveau_experience", e.target.value)}>
                  <option value="">Choisir…</option>
                  <option>Débutant (0–1 an)</option>
                  <option>Junior (1–3 ans)</option>
                  <option>Intermédiaire (3–5 ans)</option>
                  <option>Senior (5–10 ans)</option>
                  <option>Expert (10 ans+)</option>
                </select>
              </Field>
              <Field label="Années d'expérience">
                <input type="number" min="0" max="60" className={inputCls} value={form.annees_experience}
                  onChange={(e) => set("annees_experience", e.target.value)} placeholder="ex: 5" />
              </Field>
            </div>
            <Field label="Disponibilité">
              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                {["immédiate", "1 mois", "négociable"].map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="disponibilite" value={d} checked={form.disponibilite === d}
                      onChange={() => set("disponibilite", d)}
                      className="accent-[#1B3A6B]" />
                    <span className="text-sm capitalize">{d}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Type de contrat recherché *" error={errors.type_contrat}>
              <select className={selectCls} value={form.type_contrat} onChange={(e) => set("type_contrat", e.target.value)}>
                <option value="">Choisir…</option>
                {CONTRATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Salaire souhaité">
              <input className={inputCls} value={form.salaire_souhaite} onChange={(e) => set("salaire_souhaite", e.target.value)}
                placeholder="ex: 2 000 000 GNF / mois" />
            </Field>
          </div>
        )}

        {/* ─── ÉTAPE 3 : Compétences & Présentation ─── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <Field label="Compétences principales *" error={errors.competences_principales}>
              <textarea rows={3} className={textareaCls} value={form.competences_principales}
                onChange={(e) => set("competences_principales", e.target.value)}
                placeholder="ex: Soudure TIG, lecture de plans, assemblage métallique…" />
            </Field>
            <Field label="Compétences secondaires">
              <textarea rows={3} className={textareaCls} value={form.competences_secondaires}
                onChange={(e) => set("competences_secondaires", e.target.value)}
                placeholder="ex: Gestion d'équipe, maçonnerie légère…" />
            </Field>
            <Field label="Outils / Machines / Logiciels maîtrisés">
              <textarea rows={2} className={textareaCls} value={form.outils}
                onChange={(e) => set("outils", e.target.value)}
                placeholder="ex: Excel, Autocad, perceuse à colonne, machine à coudre industrielle…" />
            </Field>
            <Field label="Titre du profil *" error={errors.titre_profil}>
              <input className={inputCls} value={form.titre_profil} onChange={(e) => set("titre_profil", e.target.value)}
                placeholder="ex: Électricien résidentiel avec 8 ans d'expérience" />
            </Field>
            <Field label="Description courte *" error={errors.description_courte}>
              <textarea rows={2} className={textareaCls} value={form.description_courte}
                onChange={(e) => set("description_courte", e.target.value)}
                placeholder="1-2 phrases qui résument ton profil" />
            </Field>
            <Field label="Bio détaillée">
              <textarea rows={5} className={textareaCls} value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Décris ton parcours, tes réalisations, ta passion…" />
            </Field>
          </div>
        )}

        {/* ─── ÉTAPE 4 : Médias & Documents ─── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <FileInput label="Photo de profil" accept="image/*"
              hint="JPG, PNG, WEBP — max 5 Mo"
              value={form.avatar} onChange={(f) => set("avatar", f)} />
            <FileInput label="Vidéo de présentation" accept="video/*"
              hint="MP4, MOV — max 50 Mo"
              value={form.video}
              onChange={(f) => {
                if (f && f.size > 50 * 1024 * 1024) {
                  setErrors((e) => ({ ...e, video: "Vidéo trop lourde (max 50 Mo)" }));
                  return;
                }
                set("video", f);
              }} />
            {errors.video && <span className="text-xs text-red-500 -mt-4">{errors.video}</span>}
            <FileInput label="Photo de preuve / réalisation" accept="image/*"
              hint="Une photo montrant ton travail"
              value={form.preuve} onChange={(f) => set("preuve", f)} />
            <FileInput label="CV (PDF)" accept=".pdf"
              hint="Fichier PDF uniquement"
              value={form.cv} onChange={(f) => set("cv", f)} />
            <FileInput label="Diplôme (PDF)" accept=".pdf"
              hint="Scan ou PDF de ton diplôme"
              value={form.diplome} onChange={(f) => set("diplome", f)} />
          </div>
        )}

        {/* ─── ÉTAPE 5 : Contact & Réglages ─── */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <Field label="Numéro WhatsApp">
              <input type="tel" className={inputCls} value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="+224 6XX XXX XXX" />
            </Field>
            <div className="mt-2 rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
              <Toggle label="Autoriser les appels téléphoniques" checked={form.appel_autorise} onChange={(v) => set("appel_autorise", v)} />
              <Toggle label="Profil public (visible dans l'annuaire)" checked={form.profil_public} onChange={(v) => set("profil_public", v)} />
              <Toggle label="Afficher mon salaire souhaité" checked={form.afficher_salaire} onChange={(v) => set("afficher_salaire", v)} />
              <Toggle label="Afficher mon numéro de téléphone" checked={form.afficher_telephone} onChange={(v) => set("afficher_telephone", v)} />
            </div>

            {globalError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {globalError}
              </div>
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
              {loading ? "Création en cours…" : "Créer mon profil"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
