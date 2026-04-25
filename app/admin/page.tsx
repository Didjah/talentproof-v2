"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "TalentProof2026!";

type Filtre = "tous" | "verifie" | "non_verifie";

interface TalentAdmin {
  id: string;
  utilisateur_id: string;
  metier_principal: string | null;
  avatar_url: string | null;
  verifie: boolean | null;
  prenom: string;
  nom: string;
  ville: string;
}

function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const [talents, setTalents] = useState<TalentAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [updating, setUpdating] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setPwError("Mot de passe incorrect.");
    }
  }

  useEffect(() => {
    if (!authenticated) return;

    async function fetchTalents() {
      setLoading(true);
      const { data } = await supabase
        .from("talents")
        .select(`
          id,
          utilisateur_id,
          metier_principal,
          avatar_url,
          verifie,
          utilisateurs (
            prenom,
            nom,
            ville
          )
        `)
        .order("id", { ascending: false });

      if (data) {
        const mapped = (data as unknown[]).map((row: unknown) => {
          const r = row as {
            id: string; utilisateur_id: string;
            metier_principal: string | null; avatar_url: string | null; verifie: boolean | null;
            utilisateurs: { prenom: string; nom: string; ville: string } | null;
          };
          return {
            id: r.id,
            utilisateur_id: r.utilisateur_id,
            metier_principal: r.metier_principal,
            avatar_url: r.avatar_url,
            verifie: r.verifie,
            prenom: r.utilisateurs?.prenom ?? "",
            nom: r.utilisateurs?.nom ?? "",
            ville: r.utilisateurs?.ville ?? "",
          };
        });
        setTalents(mapped);
      }
      setLoading(false);
    }

    fetchTalents();
  }, [authenticated]);

  async function toggleVerifie(talent: TalentAdmin, newVal: boolean) {
    setUpdating(talent.id);
    const { error } = await supabase
      .from("talents")
      .update({ verifie: newVal })
      .eq("id", talent.id);

    if (!error) {
      setTalents((prev) => prev.map((t) => t.id === talent.id ? { ...t, verifie: newVal } : t));
    }
    setUpdating(null);
  }

  const filtered = talents.filter((t) => {
    if (filtre === "verifie")     return t.verifie === true;
    if (filtre === "non_verifie") return !t.verifie;
    return true;
  });

  /* ── Écran connexion ── */
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8 flex flex-col gap-6">
          <div className="text-center">
            <Link href="/">
              <img src="/logo.png" alt="TalentProof" className="h-9 mx-auto mb-4" />
            </Link>
            <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>Administration</h1>
            <p className="text-sm text-gray-500 mt-1">Accès réservé aux administrateurs</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Mot de passe admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(""); }}
                placeholder="••••••••••••"
                required
                autoFocus
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#1B3A6B]"
              />
            </div>
            {pwError && <p className="text-xs text-red-500 text-center">{pwError}</p>}
            <button
              type="submit"
              className="rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              Accéder au panneau admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard admin ── */
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold rounded-full px-3 py-1 text-white" style={{ backgroundColor: NAVY }}>
              🔒 Admin
            </span>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>Vérification des profils</h1>
            <p className="text-sm text-gray-500 mt-0.5">{talents.length} talent{talents.length !== 1 ? "s" : ""} au total</p>
          </div>

          {/* Statistiques rapides */}
          <div className="flex gap-3">
            <div className="bg-white rounded-2xl px-4 py-3 text-center shadow-sm border border-gray-100">
              <p className="text-xl font-extrabold" style={{ color: GOLD }}>{talents.filter((t) => t.verifie).length}</p>
              <p className="text-xs text-gray-500">Vérifiés</p>
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 text-center shadow-sm border border-gray-100">
              <p className="text-xl font-extrabold" style={{ color: NAVY }}>{talents.filter((t) => !t.verifie).length}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "tous",        label: "Tous" },
            { key: "verifie",     label: "✓ Vérifiés" },
            { key: "non_verifie", label: "⏳ Non vérifiés" },
          ] as { key: Filtre; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltre(key)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
              style={
                filtre === key
                  ? { backgroundColor: NAVY, color: "#fff" }
                  : { backgroundColor: "#fff", color: NAVY, border: `1.5px solid ${NAVY}` }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Liste des talents ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400 shadow-sm">
            <p className="text-3xl mb-3">👤</p>
            <p className="text-sm font-medium">Aucun profil dans cette catégorie</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((talent) => {
              const nomComplet = `${talent.prenom} ${talent.nom}`.trim() || "—";
              const isUpdating = updating === talent.id;

              return (
                <div
                  key={talent.id}
                  className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-4 flex-wrap"
                >
                  {/* Avatar */}
                  {talent.avatar_url ? (
                    <img
                      src={talent.avatar_url}
                      alt={nomComplet}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2"
                      style={{ borderColor: NAVY + "33" }}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: NAVY }}
                    >
                      {initiales(talent.prenom, talent.nom)}
                    </div>
                  )}

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-gray-900 truncate">{nomComplet}</p>
                      {talent.verifie && (
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: GOLD }}>
                          ✓ Vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {talent.metier_principal ?? "—"}
                      {talent.ville ? ` · ${talent.ville}` : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <Link
                      href={`/profil/${talent.utilisateur_id}`}
                      target="_blank"
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#EEF2F9]"
                      style={{ borderColor: NAVY, color: NAVY }}
                    >
                      Voir profil
                    </Link>

                    {talent.verifie ? (
                      <button
                        onClick={() => toggleVerifie(talent, false)}
                        disabled={isUpdating}
                        className="rounded-full bg-red-100 text-red-600 px-3 py-1.5 text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "…" : "✗ Révoquer"}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleVerifie(talent, true)}
                        disabled={isUpdating}
                        className="rounded-full px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: GOLD }}
                      >
                        {isUpdating ? "…" : "✓ Vérifier"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-white/60 mt-4" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— Panneau d&apos;administration
      </footer>
    </div>
  );
}
