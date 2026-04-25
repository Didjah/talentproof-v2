"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

/* ─── Interfaces ──────────────────────────────────────────────────────────── */

interface Session {
  utilisateur_id: string;
  telephone: string;
}

interface Formation {
  nom: string;
  duree: string;
  prix: string;
  niveau: string;
}

interface Centre {
  utilisateur_id: string;
  nom_centre: string;
  logo_url: string | null;
  domaine_formation: string | null;
  ville: string | null;
  pays: string | null;
  taux_reussite: string | null;
  mode_formation: string | null;
  public_cible: string | null;
  formations: Formation[] | null;
}

interface Apprenant {
  id: string;
  talent_utilisateur_id: string | null;
  competence_acquise: string | null;
  temoignage: string | null;
  talent_prenom: string;
  talent_nom: string;
  talent_avatar: string | null;
}

/* ─── Formulaire de connexion ─────────────────────────────────────────────── */

function ConnexionForm({ onSuccess }: { onSuccess: (s: Session) => void }) {
  const [telephone, setTelephone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("utilisateurs")
      .select("id")
      .eq("telephone", telephone.trim())
      .eq("pin", pin.trim())
      .eq("role", "centre_formation")
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("Téléphone ou PIN incorrect.");
      return;
    }

    const session: Session = { utilisateur_id: data.id, telephone: telephone.trim() };
    localStorage.setItem("tp_centre", JSON.stringify(session));
    onSuccess(session);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#EEF2F9" }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8 flex flex-col gap-6">
        <div className="text-center">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" className="h-9 mx-auto mb-4" />
          </Link>
          <h1 className="text-xl font-extrabold" style={{ color: NAVY }}>Espace Centre de Formation</h1>
          <p className="text-sm text-gray-500 mt-1">Connectez-vous pour gérer votre centre</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+224 6XX XXX XXX"
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#1B3A6B]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Code PIN (4 chiffres)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={4}
              required
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm tracking-widest focus:outline-none focus:border-[#1B3A6B]"
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: NAVY }}
          >
            {loading ? "Vérification…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Pas encore inscrit ?{" "}
          <Link href="/inscription?role=centre" className="font-semibold hover:underline" style={{ color: NAVY }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────────────────────────── */

export default function EspaceCentrePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [centre, setCentre] = useState<Centre | null>(null);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchDashboard = useCallback(async (utilisateur_id: string) => {
    const { data: cData } = await supabase
      .from("centres_formation")
      .select(`
        utilisateur_id,
        nom_centre,
        logo_url,
        domaine_formation,
        ville,
        pays,
        taux_reussite,
        mode_formation,
        public_cible,
        formations
      `)
      .eq("utilisateur_id", utilisateur_id)
      .single();

    if (cData) setCentre(cData as Centre);

    // Apprenants — table peut ne pas exister encore
    try {
      const { data: appData, error } = await supabase
        .from("apprenants")
        .select(`
          id,
          talent_utilisateur_id,
          competence_acquise,
          temoignage,
          talents (
            avatar_url,
            utilisateurs (
              prenom,
              nom
            )
          )
        `)
        .eq("centre_utilisateur_id", utilisateur_id)
        .order("id", { ascending: false })
        .limit(20);

      if (!error && appData) {
        const mapped = (appData as unknown[]).map((a: unknown) => {
          const row = a as {
            id: string; talent_utilisateur_id: string | null;
            competence_acquise: string | null; temoignage: string | null;
            talents: { avatar_url: string | null;
              utilisateurs: { prenom: string; nom: string } | null } | null;
          };
          return {
            id: row.id,
            talent_utilisateur_id: row.talent_utilisateur_id,
            competence_acquise: row.competence_acquise,
            temoignage: row.temoignage,
            talent_prenom: row.talents?.utilisateurs?.prenom ?? "",
            talent_nom: row.talents?.utilisateurs?.nom ?? "",
            talent_avatar: row.talents?.avatar_url ?? null,
          };
        });
        setApprenants(mapped);
      }
    } catch { /* table absente */ }

    setLoading(false);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("tp_centre");
    if (!raw) { setAuthChecked(true); setLoading(false); return; }
    try {
      const sess = JSON.parse(raw) as Session;
      if (!sess.utilisateur_id) throw new Error();
      setSession(sess);
      setAuthChecked(true);
      fetchDashboard(sess.utilisateur_id);
    } catch {
      localStorage.removeItem("tp_centre");
      setAuthChecked(true);
      setLoading(false);
    }
  }, [fetchDashboard]);

  function handleLoginSuccess(sess: Session) {
    setSession(sess);
    setLoading(true);
    fetchDashboard(sess.utilisateur_id);
  }

  function handleLogout() {
    localStorage.removeItem("tp_centre");
    setSession(null);
    setCentre(null);
    setApprenants([]);
  }

  if (!authChecked) return null;
  if (!session) return <ConnexionForm onSuccess={handleLoginSuccess} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF2F9" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const formations: Formation[] = Array.isArray(centre?.formations) ? centre!.formations! : [];

  function initiales(nom: string) {
    return nom.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{ backgroundColor: "#EEF2F9" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ── En-tête centre ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {centre?.logo_url ? (
              <img
                src={centre.logo_url}
                alt={centre.nom_centre}
                className="w-16 h-16 rounded-2xl object-contain border border-gray-200 shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: NAVY }}
              >
                {initiales(centre?.nom_centre ?? "C")}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold leading-tight truncate" style={{ color: NAVY }}>
                {centre?.nom_centre ?? "Mon centre"}
              </h1>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                {centre?.domaine_formation && (
                  <span className="text-xs text-gray-500">🎓 {centre.domaine_formation}</span>
                )}
                {centre?.ville && (
                  <span className="text-xs text-gray-500">
                    📍 {[centre.ville, centre.pays].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/centre/${session.utilisateur_id}`}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              👁 Voir ma page publique
            </Link>
            <Link
              href="/modifier-centre"
              className="inline-flex items-center gap-1.5 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#1B3A6B] hover:text-white"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              ✏️ Modifier ma page
            </Link>
          </div>
        </section>

        {/* ── Statistiques ── */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { value: formations.length,       label: "Formation" + (formations.length !== 1 ? "s" : "") },
            { value: apprenants.length,        label: "Apprenant" + (apprenants.length !== 1 ? "s" : "") },
            { value: centre?.taux_reussite ?? "—", label: "Taux de réussite" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl px-3 py-4 shadow-sm flex flex-col items-center gap-1 border border-gray-100 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: GOLD }}>{value}</span>
              <span className="text-xs text-gray-500 font-medium leading-snug">{label}</span>
            </div>
          ))}
        </section>

        {/* ── Actions rapides ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold px-1" style={{ color: NAVY }}>Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "✏️",  label: "Modifier ma page",        href: "/modifier-centre" },
              { icon: "📚", label: "Ajouter une formation",    href: "/ajouter-formation" },
              { icon: "🔍", label: "Parcourir les talents",    href: "/annuaire" },
            ].map(({ icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-[#1B3A6B] transition-colors group"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1B3A6B] transition-colors leading-snug">{label}</span>
                <span className="ml-auto text-gray-300 group-hover:text-[#1B3A6B] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Mes formations ── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold" style={{ color: NAVY }}>Mes formations</h2>
            <Link
              href="/ajouter-formation"
              className="text-xs font-semibold rounded-full px-4 py-1.5 text-white"
              style={{ backgroundColor: GOLD }}
            >
              + Ajouter
            </Link>
          </div>

          {formations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-3">📚</p>
              <p className="text-sm font-medium">Aucune formation publiée</p>
              <p className="text-xs mt-1">Ajoutez vos formations pour attirer des candidats.</p>
              <Link
                href="/ajouter-formation"
                className="inline-block mt-5 rounded-full px-6 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                Ajouter une formation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formations.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                  <p className="font-bold text-sm leading-snug" style={{ color: NAVY }}>{f.nom}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.duree && (
                      <span className="rounded-full bg-[#EEF2F9] px-3 py-1 text-xs font-medium text-gray-600">⏱ {f.duree}</span>
                    )}
                    {f.niveau && (
                      <span className="rounded-full bg-[#EEF2F9] px-3 py-1 text-xs font-medium text-gray-600">📶 {f.niveau}</span>
                    )}
                    {f.prix && (
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ backgroundColor: GOLD + "22", color: NAVY }}
                      >
                        💰 {f.prix}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/modifier-centre"
                    className="self-start text-xs font-semibold hover:underline"
                    style={{ color: NAVY }}
                  >
                    Modifier →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Mes apprenants ── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold" style={{ color: NAVY }}>Mes apprenants</h2>
            <Link
              href="/ajouter-apprenant"
              className="text-xs font-semibold rounded-full px-4 py-1.5 text-white"
              style={{ backgroundColor: GOLD }}
            >
              + Ajouter
            </Link>
          </div>

          {apprenants.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-3">🎓</p>
              <p className="text-sm font-medium">Aucun apprenant enregistré</p>
              <p className="text-xs mt-1">Ajoutez vos apprenants pour valoriser vos résultats.</p>
              <Link
                href="/ajouter-apprenant"
                className="inline-block mt-5 rounded-full px-6 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                Ajouter un apprenant
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apprenants.map((a) => {
                const nomComplet = `${a.talent_prenom} ${a.talent_nom}`.trim() || "Apprenant";
                return (
                  <div key={a.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {a.talent_avatar ? (
                        <img
                          src={a.talent_avatar}
                          alt={nomComplet}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border-2"
                          style={{ borderColor: NAVY + "33" }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: NAVY }}
                        >
                          {`${a.talent_prenom?.[0] ?? ""}${a.talent_nom?.[0] ?? ""}`.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{nomComplet}</p>
                        {a.competence_acquise && (
                          <p className="text-xs truncate" style={{ color: GOLD }}>{a.competence_acquise}</p>
                        )}
                      </div>
                    </div>

                    {a.temoignage && (
                      <p className="text-xs text-gray-500 leading-relaxed italic">
                        &ldquo;{a.temoignage}&rdquo;
                      </p>
                    )}

                    {a.talent_utilisateur_id && (
                      <Link
                        href={`/profil/${a.talent_utilisateur_id}`}
                        target="_blank"
                        className="self-start text-xs font-semibold hover:underline"
                        style={{ color: NAVY }}
                      >
                        Voir le profil →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white/60 mt-4" style={{ backgroundColor: NAVY }}>
        <Link href="/" className="hover:text-white transition-colors">TalentProof</Link>
        {" "}— la preuve que la compétence mérite d&apos;être vue.
      </footer>
    </div>
  );
}
