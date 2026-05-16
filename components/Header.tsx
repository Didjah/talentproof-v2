"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

type Role = "talent" | "recruteur" | "entreprise" | "centre";

const SESSION_KEYS: Record<Role, string> = {
  talent:     "tp_talent",
  recruteur:  "tp_recruteur",
  entreprise: "tp_entreprise",
  centre:     "tp_centre",
};

const DASHBOARD_HREF: Record<Role, string> = {
  talent:     "/dashboard",
  recruteur:  "/espace-recruteur",
  entreprise: "/espace-entreprise",
  centre:     "/espace-centre",
};

export default function Header() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (localStorage.getItem("tp_talent"))     { setRole("talent");     return; }
    if (localStorage.getItem("tp_recruteur"))  { setRole("recruteur");  return; }
    if (localStorage.getItem("tp_entreprise")) { setRole("entreprise"); return; }
    if (localStorage.getItem("tp_centre"))     { setRole("centre");     return; }
  }, []);

  function handleLogout() {
    Object.values(SESSION_KEYS).forEach((k) => localStorage.removeItem(k));
    setRole(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <img src="/logo.png" alt="TalentProof" style={{ height: "36px", width: "auto" }} />
        </Link>

        {/* Nav centrale */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Talents</Link>
          <Link href="/annuaire-entreprises" className="hover:text-[#1B3A6B] transition-colors">Entreprises</Link>
          <Link href="/annuaire-centres" className="hover:text-[#1B3A6B] transition-colors">Centres</Link>
          <Link href="/annuaire-offres" className="hover:text-[#1B3A6B] transition-colors">Offres</Link>
          <Link href="/espace-recruteur" className="hover:text-[#1B3A6B] transition-colors">Espace Recruteur</Link>
          <Link href="/a-propos" className="hover:text-[#1B3A6B] transition-colors">Devenir Partenaire</Link>
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2 shrink-0">
          {role ? (
            <>
              <Link
                href={DASHBOARD_HREF[role]}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                Mon Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-semibold border-2 transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                style={{ borderColor: NAVY, color: NAVY }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="rounded-full px-4 py-2 text-sm font-semibold border-2 transition-colors hover:bg-[#EEF2F9]"
                style={{ borderColor: NAVY, color: NAVY }}
              >
                Connexion
              </Link>
              <Link
                href="/inscription?role=talent"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                Créer mon profil
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
