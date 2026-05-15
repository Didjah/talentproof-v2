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
const labelCls = "text-xs font-semibold text-gray-600";

const SQL_CREATE_TABLE = `CREATE TABLE IF NOT EXISTS apprenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid REFERENCES centres_formation(id) ON DELETE CASCADE,
  nom_complet text NOT NULL,
  telephone text,
  formation_suivie text,
  date_inscription date,
  statut text DEFAULT 'En cours',
  created_at timestamptz DEFAULT now()
);`;

interface Session {
  utilisateur_id: string;
  telephone: string;
}

interface Formation {
  id: string;
  nom: string;
}

type SuccessState = { nomComplet: string };

export default function AjouterApprenantPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [centreId, setCentreId] = useState<string | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [tableAbsente, setTableAbsente] = useState(false);

  const [nomComplet, setNomComplet] = useState("");
  const [telephone, setTelephone] = useState("");
  const [formationSuivie, setFormationSuivie] = useState("");
  const [dateInscription, setDateInscription] = useState("");
  const [statut, setStatut] = useState("En cours");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("tp_centre");
    if (!raw) {
      router.replace("/espace-centre");
      return;
    }
    let sess: Session;
    try {
      sess = JSON.parse(raw) as Session;
      if (!sess.utilisateur_id) throw new Error();
    } catch {
      localStorage.removeItem("tp_centre");
      router.replace("/espace-centre");
      return;
    }
    setSession(sess);
    setAuthChecked(true);

    async function loadCentre(utilisateur_id: string) {
      const { data: centreData } = await supabase
        .from("centres_formation")
        .select("id")
        .eq("utilisateur_id", utilisateur_id)
        .single();

      if (centreData) {
        setCentreId(centreData.id);

        const { data: fData } = await supabase
          .from("formations")
          .select("id, nom")
          .eq("centre_id", centreData.id)
          .order("created_at", { ascending: false });

        if (fData) setFormations(fData as Formation[]);
      }
    }

    loadCentre(sess.utilisateur_id);
  }, [router]);

  function resetForm() {
    setNomComplet("");
    setTelephone("");
    setFormationSuivie("");
    setDateInscription("");
    setStatut("En cours");
    setError("");
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !centreId) return;

    if (!nomComplet.trim()) {
      setError("Le nom complet est obligatoire.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: dbError } = await supabase.from("apprenants").insert({
      centre_id: centreId,
      nom_complet: nomComplet.trim(),
      telephone: telephone.trim() || null,
      formation_suivie: formationSuivie.trim() || null,
      date_inscription: dateInscription || null,
      statut,
    });

    setLoading(false);

    if (dbError) {
      if (
        dbError.message.includes("does not exist") ||
        dbError.message.includes("relation") ||
        dbError.code === "42P01"
      ) {
        setTableAbsente(true);
        return;
      }
      setError("Erreur : " + dbError.message);
      return;
    }

    setSuccess({ nomComplet: nomComplet.trim() });
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL_CREATE_TABLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!authChecked) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/espace-centre" className="font-medium hover:underline" style={{ color: NAVY }}>
            ← Espace Centre
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">Ajouter un apprenant</span>
        </div>

        {/* ── Table absente ── */}
        {tableAbsente && (
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h2 className="font-extrabold text-base" style={{ color: NAVY }}>
                  Table &ldquo;apprenants&rdquo; non créée
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Exécutez ce SQL dans l&apos;éditeur Supabase pour créer la table, puis revenez ici.
                </p>
              </div>
            </div>

            <div className="relative">
              <pre className="rounded-xl bg-gray-900 text-green-400 text-xs p-4 overflow-x-auto leading-relaxed">
                {SQL_CREATE_TABLE}
              </pre>
              <button
                onClick={copySQL}
                className="absolute top-3 right-3 rounded-lg px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD }}
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Supabase → SQL Editor → coller le code → Run
            </p>

            <Link
              href="/espace-centre"
              className="self-start rounded-full px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              ← Retour au dashboard
            </Link>
          </div>
        )}

        {/* ── Succès ── */}
        {!tableAbsente && success && (
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center gap-5 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: "#D1FAE5" }}
            >
              🎓
            </div>
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: NAVY }}>
                Apprenant ajouté !
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-gray-700">{success.nomComplet}</span> a bien été enregistré.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={resetForm}
                className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                + Ajouter un autre
              </button>
              <Link
                href="/espace-centre"
                className="flex-1 rounded-full py-3 text-sm font-semibold text-center border-2 transition-colors hover:bg-gray-50"
                style={{ borderColor: NAVY, color: NAVY }}
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        )}

        {/* ── Formulaire ── */}
        {!tableAbsente && !success && (
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>
                Ajouter un apprenant
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enregistrez un étudiant formé dans votre centre.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Nom complet */}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>
                  Nom complet <span style={{ color: GOLD }}>*</span>
                </label>
                <input
                  type="text"
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  placeholder="Ex : Mamadou Diallo"
                  required
                  className={inputCls}
                />
              </div>

              {/* Téléphone */}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex : +224 6XX XXX XXX"
                  className={inputCls}
                />
              </div>

              {/* Formation suivie */}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Formation suivie</label>
                {formations.length > 0 ? (
                  <select
                    value={formationSuivie}
                    onChange={(e) => setFormationSuivie(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Sélectionner une formation —</option>
                    {formations.map((f) => (
                      <option key={f.id} value={f.nom}>{f.nom}</option>
                    ))}
                    <option value="__autre">Autre (saisir manuellement)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formationSuivie}
                    onChange={(e) => setFormationSuivie(e.target.value)}
                    placeholder="Ex : Formation en développement web"
                    className={inputCls}
                  />
                )}
                {formations.length > 0 && formationSuivie === "__autre" && (
                  <input
                    type="text"
                    onChange={(e) => setFormationSuivie(e.target.value)}
                    placeholder="Saisir la formation…"
                    className={inputCls + " mt-2"}
                    autoFocus
                  />
                )}
              </div>

              {/* Date d'inscription + Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Date d&apos;inscription</label>
                  <input
                    type="date"
                    value={dateInscription}
                    onChange={(e) => setDateInscription(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Statut</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value)}
                    className={selectCls}
                  >
                    <option>En cours</option>
                    <option>Diplômé</option>
                    <option>Abandonné</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: NAVY }}
                >
                  {loading ? "Enregistrement…" : "Ajouter l'apprenant"}
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
        )}
      </main>

      <footer className="py-6 text-center text-sm text-white/60 mt-4" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
