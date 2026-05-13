"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import Header from "@/components/Header";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

const inputCls =
  "rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition w-full bg-white";
const selectCls = inputCls;
const textareaCls = inputCls + " resize-none";
const labelCls = "text-xs font-semibold text-gray-600";

interface Session {
  utilisateur_id: string;
  telephone: string;
}

export default function AjouterFormationPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("");
  const [prix, setPrix] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [niveau, setNiveau] = useState("Aucun");
  const [mode, setMode] = useState("Présentiel");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("tp_centre");
    if (!raw) {
      router.replace("/espace-centre");
      return;
    }
    try {
      const sess = JSON.parse(raw) as Session;
      if (!sess.utilisateur_id) throw new Error();
      setSession(sess);
    } catch {
      localStorage.removeItem("tp_centre");
      router.replace("/espace-centre");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!titre.trim()) {
      setError("Le titre de la formation est obligatoire.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: dbError } = await supabase.from("formations").insert({
      centre_id: session.utilisateur_id,
      nom: titre.trim(),
      description: description.trim() || null,
      duree: duree.trim() || null,
      prix: prix.trim() || null,
      ville: ville.trim() || null,
      pays: pays.trim() || null,
      prochaine_session: dateDebut || null,
      niveau: niveau !== "Aucun" ? niveau : null,
      mode: mode,
    });

    setLoading(false);

    if (dbError) {
      setError("Erreur lors de l'enregistrement : " + dbError.message);
      return;
    }

    router.push("/espace-centre");
  }

  if (!authChecked) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/espace-centre" className="font-medium hover:underline" style={{ color: NAVY }}>
            ← Espace Centre
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">Ajouter une formation</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>
              Ajouter une formation
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Publiez une nouvelle formation pour attirer des candidats.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Titre */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>
                Titre de la formation <span style={{ color: GOLD }}>*</span>
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex : Formation en développement web"
                required
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le contenu, les objectifs et le programme de la formation…"
                rows={4}
                className={textareaCls}
              />
            </div>

            {/* Durée + Prix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Durée</label>
                <input
                  type="text"
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  placeholder="Ex : 3 mois, 6 semaines"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Prix (FCFA)</label>
                <input
                  type="text"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  placeholder="Ex : 500 000 FCFA"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Ville + Pays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Ville</label>
                <input
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Ex : Conakry"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Pays</label>
                <input
                  type="text"
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  placeholder="Ex : Guinée"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Date de début */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Niveau + Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Niveau requis</label>
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                  className={selectCls}
                >
                  <option>Aucun</option>
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Mode de formation</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className={selectCls}
                >
                  <option>Présentiel</option>
                  <option>En ligne</option>
                  <option>Hybride</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: NAVY }}
              >
                {loading ? "Enregistrement…" : "Publier la formation"}
              </button>
              <Link
                href="/espace-centre"
                className="flex-1 rounded-full py-3 text-sm font-semibold text-center border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: NAVY, color: NAVY }}
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-white/60 mt-4" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">
          TalentProof
        </Link>{" "}
        — la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
