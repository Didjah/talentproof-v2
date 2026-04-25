"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

export default function ConnexionPage() {
  const router = useRouter();
  const [telephone, setTelephone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Vérifier dans utilisateurs (role = 'talent')
    const { data: userData, error: userError } = await supabase
      .from("utilisateurs")
      .select("id")
      .eq("telephone", telephone.trim())
      .eq("pin", pin.trim())
      .eq("role", "talent")
      .single();

    if (userError || !userData) {
      setError("Téléphone ou PIN incorrect. Vérifiez vos informations.");
      setLoading(false);
      return;
    }

    // 2. Récupérer l'id du profil talent
    const { data: talentData, error: talentError } = await supabase
      .from("talents")
      .select("id")
      .eq("utilisateur_id", userData.id)
      .single();

    if (talentError || !talentData) {
      setError("Profil talent introuvable. Contactez le support.");
      setLoading(false);
      return;
    }

    // 3. Stocker la session
    const session = {
      id: talentData.id,
      utilisateur_id: userData.id,
      telephone: telephone.trim(),
    };
    localStorage.setItem("tp_talent", JSON.stringify(session));

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: "#EEF2F9" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col gap-6">
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{ backgroundColor: NAVY }}
              >
                👤
              </div>
              <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>Connexion talent</h1>
              <p className="text-sm text-gray-500 mt-1">Accédez à votre espace personnel</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+224 6XX XXX XXX"
                  required
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#1B3A6B]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Code PIN (4 chiffres)</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  required
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm tracking-[0.5em] text-center focus:outline-none focus:border-[#1B3A6B]"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: NAVY }}
              >
                {loading ? "Vérification…" : "Se connecter →"}
              </button>
            </form>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-center">
              <p className="text-xs text-gray-500">
                Pas encore de profil ?{" "}
                <Link href="/inscription?role=talent" className="font-semibold hover:underline" style={{ color: NAVY }}>
                  Créer mon profil
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                Recruteur ?{" "}
                <Link href="/espace-recruteur" className="hover:underline" style={{ color: GOLD }}>
                  Espace recruteur
                </Link>
              </p>
            </div>
          </div>

          {/* Info sécurité */}
          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
            Votre PIN est le code à 4 chiffres choisi lors de votre inscription sur TalentProof.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-white/60" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
