import Link from "next/link";
import { TalentForm } from "./TalentForm";
import { RecruteurForm } from "./RecruteurForm";
import { EntrepriseForm } from "./EntrepriseForm";
import { CentreForm } from "./CentreForm";

const GREEN = "#1a5c3a";

const roles = [
  { emoji: "🧑‍💼", label: "Talent", desc: "Montre tes compétences réelles", role: "talent" },
  { emoji: "🔍", label: "Recruteur", desc: "Trouve les bons profils rapidement", role: "recruteur" },
  { emoji: "🏢", label: "Entreprise", desc: "Gérez vos besoins en recrutement", role: "entreprise" },
  { emoji: "🎓", label: "Centre de formation", desc: "Valorisez vos apprenants", role: "centre" },
];

function FormSelector({ role }: { role: string | undefined }) {
  if (role === "talent") return <TalentForm />;
  if (role === "recruteur") return <RecruteurForm />;
  if (role === "entreprise") return <EntrepriseForm />;
  if (role === "centre") return <CentreForm />;
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ color: GREEN }}>
        Créer mon profil
      </h1>
      <p className="text-center text-gray-500 mb-10 text-sm">
        Choisissez votre type de compte pour commencer
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {roles.map(({ emoji, label, desc, role: r }) => (
          <Link
            key={r}
            href={`/inscription?role=${r}`}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:border-[#1a5c3a] hover:shadow-md"
          >
            <span className="text-4xl">{emoji}</span>
            <span className="text-lg font-bold" style={{ color: GREEN }}>{label}</span>
            <span className="text-sm text-gray-500">{desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight" style={{ color: GREEN }}>
            TalentProof
          </Link>
          {role ? (
            <Link href="/inscription" className="text-sm text-gray-500 hover:text-[#1a5c3a] transition-colors">
              ← Changer de rôle
            </Link>
          ) : (
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1a5c3a] transition-colors">
              ← Retour
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
        <FormSelector role={role} />
      </main>

      <footer className="py-6 text-center text-sm text-white" style={{ backgroundColor: GREEN }}>
        TalentProof — la preuve que la compétence mérite d'être vue.
      </footer>
    </div>
  );
}
