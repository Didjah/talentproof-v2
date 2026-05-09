"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

export default function Header() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(!!localStorage.getItem("tp_talent"));
  }, []);

  function handleLogout() {
    localStorage.removeItem("tp_talent");
    setConnected(false);
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
          <Link href="/annuaire" className="hover:text-[#1B3A6B] transition-colors">Annuaire</Link>
          <Link href="/espace-recruteur" className="hover:text-[#1B3A6B] transition-colors">Espace Recruteur</Link>
          <Link href="/a-propos" className="hover:text-[#1B3A6B] transition-colors">Devenir Partenaire</Link>
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2 shrink-0">
          {connected ? (
            <>
              <Link
                href="/dashboard"
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
