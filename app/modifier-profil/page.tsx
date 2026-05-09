"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

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

interface Session {
  id: string;
  utilisateur_id: string;
  telephone: string;
}

interface FormState {
  prenom: string;
  nom: string;
  ville: string;
  pays: string;
  langues: string;
  metier_principal: string;
  second_metier: string;
  secteur: string;
  niveau_experience: string;
  annees_experience: string;
  disponibilite: string;
  type_contrat: string;
  salaire_souhaite: string;
  competences_principales: string;
  competences_secondaires: string;
  outils: string;
  titre_profil: string;
  description_courte: string;
  bio: string;
  whatsapp: string;
  avatar_url: string | null;
  video_presentation_url: string | null;
}

const EMPTY: FormState = {
  prenom: "", nom: "", ville: "", pays: "", langues: "",
  metier_principal: "", second_metier: "", secteur: "",
  niveau_experience: "", annees_experience: "", disponibilite: "immédiate",
  type_contrat: "", salaire_souhaite: "",
  competences_principales: "", competences_secondaires: "", outils: "",
  titre_profil: "", description_courte: "", bio: "",
  whatsapp: "", avatar_url: null, video_presentation_url: null,
};

const inputCls = "rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition bg-white w-full";
const selectCls = inputCls;
const textareaCls = inputCls + " resize-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function SectionCard({
  id, icon, title, children,
}: {
  id?: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-5 scroll-mt-24">
      <div className="flex items-center gap-3 pb-1 border-b border-gray-100">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-base font-extrabold" style={{ color: NAVY }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FileRow({
  icon, label, hint, accept, currentUrl, newFile, onNewFile,
}: {
  icon: string;
  label: string;
  hint: string;
  accept: string;
  currentUrl: string | null;
  newFile: File | null;
  onNewFile: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-600">{icon} {label}</span>
      {currentUrl && !newFile && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-2 text-xs text-green-700 flex items-center gap-2">
          <span>✓ Fichier actuel enregistré</span>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto font-semibold hover:underline shrink-0"
          >
            Voir →
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors text-left"
      >
        <span>📎</span>
        <span className="flex-1 truncate">
          {newFile ? newFile.name : "Choisir un nouveau fichier…"}
        </span>
        {newFile && (
          <span
            className="text-red-400 hover:text-red-600 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              onNewFile(null);
              if (ref.current) ref.current.value = "";
            }}
          >
            ✕
          </span>
        )}
      </button>
      <span className="text-xs text-gray-400">{hint}</span>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onNewFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function ModifierProfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("tp_talent");
    if (!raw) { router.replace("/connexion"); return; }

    let sess: Session;
    try { sess = JSON.parse(raw) as Session; }
    catch { router.replace("/connexion"); return; }

    if (!sess.utilisateur_id) { router.replace("/connexion"); return; }
    setSession(sess);

    (async () => {
      const { data } = await supabase
        .from("talents")
        .select(`
          ville, pays, langues,
          metier_principal, second_metier, secteur,
          niveau_experience, annees_experience, disponibilite,
          type_contrat, salaire_souhaite,
          competences_principales, competences_secondaires, outils,
          titre_profil, description_courte, bio,
          whatsapp, avatar_url, video_presentation_url,
          utilisateurs ( prenom, nom )
        `)
        .eq("utilisateur_id", sess.utilisateur_id)
        .single();

      if (data) {
        const u = data.utilisateurs as unknown as { prenom: string; nom: string } | null;
        setForm({
          prenom: u?.prenom ?? "",
          nom: u?.nom ?? "",
          ville: data.ville ?? "",
          pays: data.pays ?? "",
          langues: data.langues ?? "",
          metier_principal: data.metier_principal ?? "",
          second_metier: data.second_metier ?? "",
          secteur: data.secteur ?? "",
          niveau_experience: data.niveau_experience ?? "",
          annees_experience: data.annees_experience != null ? String(data.annees_experience) : "",
          disponibilite: data.disponibilite ?? "immédiate",
          type_contrat: data.type_contrat ?? "",
          salaire_souhaite: data.salaire_souhaite ?? "",
          competences_principales: data.competences_principales ?? "",
          competences_secondaires: data.competences_secondaires ?? "",
          outils: data.outils ?? "",
          titre_profil: data.titre_profil ?? "",
          description_courte: data.description_courte ?? "",
          bio: data.bio ?? "",
          whatsapp: data.whatsapp ?? "",
          avatar_url: data.avatar_url ?? null,
          video_presentation_url: data.video_presentation_url ?? null,
        });
      }
      setLoading(false);
    })();
  }, [router]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const uid = session.utilisateur_id;
      const ts = Date.now();

      const [avatar_url, video_presentation_url] = await Promise.all([
        newAvatar ? uploadFile(newAvatar, "avatars", `${uid}/avatar_${ts}`) : Promise.resolve(form.avatar_url),
        newVideo ? uploadFile(newVideo, "videos", `${uid}/video_${ts}`) : Promise.resolve(form.video_presentation_url),
      ]);

      const [{ error: userErr }, { error: talentErr }] = await Promise.all([
        supabase
          .from("utilisateurs")
          .update({ prenom: form.prenom.trim(), nom: form.nom.trim() })
          .eq("id", uid),
        supabase
          .from("talents")
          .update({
            ville: form.ville.trim(),
            pays: form.pays,
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
            whatsapp: form.whatsapp.trim(),
            avatar_url,
            video_presentation_url,
          })
          .eq("utilisateur_id", uid),
      ]);

      if (userErr || talentErr) {
        setError(userErr?.message ?? talentErr?.message ?? "Erreur lors de la sauvegarde.");
      } else {
        setForm((f) => ({ ...f, avatar_url, video_presentation_url }));
        setNewAvatar(null);
        setNewVideo(null);
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      setError("Erreur technique : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: NAVY, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "32px", width: "auto" }} />
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-gray-500 hover:text-[#1B3A6B] transition-colors"
          >
            ← Mon dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Titre */}
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: NAVY }}>Modifier mon profil</h1>
          <p className="text-sm text-gray-500 mt-1">Les modifications sont enregistrées immédiatement.</p>
        </div>

        {/* Bannière succès */}
        {success && (
          <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Profil mis à jour avec succès !</p>
              <Link href="/dashboard" className="text-xs text-green-700 hover:underline">
                Retourner au dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* ── Section : Infos de base ── */}
        <SectionCard id="infos" icon="👤" title="Informations de base">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Prénom">
              <input className={inputCls} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="ex: Mamadou" />
            </Field>
            <Field label="Nom">
              <input className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="ex: Diallo" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Pays">
              <select className={selectCls} value={form.pays} onChange={(e) => set("pays", e.target.value)}>
                <option value="">Choisir…</option>
                {PAYS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Ville">
              <input className={inputCls} value={form.ville} onChange={(e) => set("ville", e.target.value)} placeholder="ex: Conakry" />
            </Field>
          </div>
          <Field label="Langues parlées">
            <input className={inputCls} value={form.langues} onChange={(e) => set("langues", e.target.value)} placeholder="ex: Français, Peul, Soussou" />
          </Field>
          <Field label="WhatsApp">
            <input type="tel" className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+224 6XX XXX XXX" />
          </Field>
        </SectionCard>

        {/* ── Section : Profil professionnel ── */}
        <SectionCard id="profil-pro" icon="💼" title="Profil professionnel">
          <Field label="Métier principal">
            <select className={selectCls} value={form.metier_principal} onChange={(e) => set("metier_principal", e.target.value)}>
              <option value="">Choisir…</option>
              {METIERS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Second métier (optionnel)">
            <input className={inputCls} value={form.second_metier} onChange={(e) => set("second_metier", e.target.value)} placeholder="ex: Photographe" />
          </Field>
          <Field label="Secteur d'activité">
            <select className={selectCls} value={form.secteur} onChange={(e) => set("secteur", e.target.value)}>
              <option value="">Choisir…</option>
              {SECTEURS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Niveau d'expérience">
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
            <div className="flex flex-wrap gap-4 mt-1">
              {["immédiate", "1 mois", "négociable"].map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="disponibilite" value={d} checked={form.disponibilite === d}
                    onChange={() => set("disponibilite", d)} className="accent-[#1B3A6B]" />
                  <span className="capitalize">{d}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Type de contrat recherché">
            <select className={selectCls} value={form.type_contrat} onChange={(e) => set("type_contrat", e.target.value)}>
              <option value="">Choisir…</option>
              {CONTRATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Salaire souhaité">
            <input className={inputCls} value={form.salaire_souhaite} onChange={(e) => set("salaire_souhaite", e.target.value)}
              placeholder="ex: 2 000 000 GNF / mois" />
          </Field>
          <Field label="Titre du profil">
            <input className={inputCls} value={form.titre_profil} onChange={(e) => set("titre_profil", e.target.value)}
              placeholder="ex: Électricien résidentiel avec 8 ans d'expérience" />
          </Field>
          <Field label="Description courte">
            <textarea rows={2} className={textareaCls} value={form.description_courte}
              onChange={(e) => set("description_courte", e.target.value)}
              placeholder="1-2 phrases qui résument votre profil" />
          </Field>
        </SectionCard>

        {/* ── Section : Compétences ── */}
        <SectionCard id="competences" icon="🔧" title="Compétences">
          <Field label="Compétences principales">
            <textarea rows={3} className={textareaCls} value={form.competences_principales}
              onChange={(e) => set("competences_principales", e.target.value)}
              placeholder="ex: Soudure TIG, lecture de plans, assemblage métallique…" />
          </Field>
          <Field label="Compétences secondaires">
            <textarea rows={3} className={textareaCls} value={form.competences_secondaires}
              onChange={(e) => set("competences_secondaires", e.target.value)}
              placeholder="ex: Gestion d'équipe, maçonnerie légère…" />
          </Field>
          <Field label="Outils / Machines / Logiciels">
            <textarea rows={2} className={textareaCls} value={form.outils}
              onChange={(e) => set("outils", e.target.value)}
              placeholder="ex: Excel, Autocad, machine à coudre industrielle…" />
          </Field>
        </SectionCard>

        {/* ── Section : Bio ── */}
        <SectionCard id="bio" icon="✍️" title="Bio">
          <Field label="Bio détaillée">
            <textarea rows={6} className={textareaCls} value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Décrivez votre parcours, vos réalisations, votre passion…" />
          </Field>
        </SectionCard>

        {/* ── Section : Médias ── */}
        <SectionCard icon="🖼️" title="Photo & Vidéo">
          {/* Photo */}
          <div id="photo" className="scroll-mt-24">
            <FileRow
              icon="📸"
              label="Photo de profil"
              hint="JPG, PNG, WEBP — max 5 Mo"
              accept="image/*"
              currentUrl={form.avatar_url}
              newFile={newAvatar}
              onNewFile={setNewAvatar}
            />
          </div>

          <div className="border-t border-gray-100" />

          {/* Vidéo */}
          <div id="video" className="scroll-mt-24">
            <FileRow
              icon="🎬"
              label="Vidéo de présentation"
              hint="MP4, MOV — max 50 Mo. Une courte vidéo pour vous présenter."
              accept="video/*"
              currentUrl={form.video_presentation_url}
              newFile={newVideo}
              onNewFile={(f) => {
                if (f && f.size > 50 * 1024 * 1024) {
                  setError("Vidéo trop lourde (max 50 Mo)");
                  return;
                }
                setError("");
                setNewVideo(f);
              }}
            />
          </div>
        </SectionCard>

        {/* Erreur */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Bouton sauvegarder */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-full py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: NAVY }}
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? "Enregistrement…" : "💾 Enregistrer les modifications"}
          </button>
          <Link
            href="/dashboard"
            className="flex-1 text-center rounded-full py-3.5 text-sm font-semibold border-2 transition-colors hover:bg-[#1B3A6B] hover:text-white"
            style={{ borderColor: NAVY, color: NAVY }}
          >
            Annuler
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-white/60" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
