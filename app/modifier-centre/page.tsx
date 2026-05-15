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

const DOMAINES = [
  "BTP",
  "Santé",
  "Tech / Informatique",
  "Transport / Logistique",
  "Agriculture",
  "Restauration / Hôtellerie",
  "Commerce / Vente",
  "Couture / Mode",
  "Mécanique / Auto",
  "Autre",
];

export default function ModifierCentrePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [nomCentre, setNomCentre] = useState("");
  const [description, setDescription] = useState("");
  const [domaine, setDomaine] = useState("");
  const [tauxReussite, setTauxReussite] = useState("");
  const [nombreApprenants, setNombreApprenants] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const { data } = await supabase
        .from("centres_formation")
        .select("nom_centre, description, domaine, taux_reussite, nombre_apprenants, whatsapp")
        .eq("utilisateur_id", utilisateur_id)
        .single();

      if (data) {
        setNomCentre(data.nom_centre ?? "");
        setDescription(data.description ?? "");
        setDomaine(data.domaine ?? "");
        setTauxReussite(data.taux_reussite != null ? String(data.taux_reussite) : "");
        setNombreApprenants(data.nombre_apprenants != null ? String(data.nombre_apprenants) : "");
        setWhatsapp(data.whatsapp ?? "");
      }
      setLoadingData(false);
    }

    loadCentre(sess.utilisateur_id);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!nomCentre.trim()) {
      setError("Le nom du centre est obligatoire.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: dbError } = await supabase
      .from("centres_formation")
      .update({
        nom_centre: nomCentre.trim(),
        description: description.trim() || null,
        domaine: domaine || null,
        taux_reussite: tauxReussite !== "" ? Number(tauxReussite) : null,
        nombre_apprenants: nombreApprenants !== "" ? Number(nombreApprenants) : null,
        whatsapp: whatsapp.trim() || null,
      })
      .eq("utilisateur_id", session.utilisateur_id);

    setLoading(false);

    if (dbError) {
      setError("Erreur lors de la mise à jour : " + dbError.message);
      return;
    }

    router.push("/espace-centre");
  }

  if (!authChecked) return null;

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/espace-centre" className="font-medium hover:underline" style={{ color: NAVY }}>
            ← Espace Centre
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">Modifier mon profil</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>
              Modifier mon profil centre
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Ces informations apparaissent sur votre page publique.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nom du centre */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>
                Nom du centre <span style={{ color: GOLD }}>*</span>
              </label>
              <input
                type="text"
                value={nomCentre}
                onChange={(e) => setNomCentre(e.target.value)}
                placeholder="Ex : Centre de Formation Excellence"
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
                placeholder="Décrivez votre centre, votre mission, votre approche pédagogique…"
                rows={4}
                className={textareaCls}
              />
            </div>

            {/* Domaine */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Domaine de formation</label>
              <select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                className={selectCls}
              >
                <option value="">— Sélectionner un domaine —</option>
                {DOMAINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Taux de réussite + Nombre apprenants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Taux de réussite (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tauxReussite}
                  onChange={(e) => setTauxReussite(e.target.value)}
                  placeholder="Ex : 85"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Nombre d&apos;apprenants formés</label>
                <input
                  type="number"
                  min={0}
                  value={nombreApprenants}
                  onChange={(e) => setNombreApprenants(e.target.value)}
                  placeholder="Ex : 200"
                  className={inputCls}
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex : +224 6XX XXX XXX"
                className={inputCls}
              />
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
                {loading ? "Enregistrement…" : "Enregistrer les modifications"}
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
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
