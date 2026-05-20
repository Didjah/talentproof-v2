const METIERS = [
  {
    emoji: "🚛",
    titre: "Chauffeur SPL",
    pays: ["🇱🇺 Luxembourg", "🇧🇪 Belgique", "🇫🇷 France"],
    salaire: "2 500 – 3 500 €/mois",
    tension: "Critique",
    tensionColor: "bg-red-500 text-white",
    competences: ["Permis CE", "FIMO/FCO", "Expérience transport"],
  },
  {
    emoji: "🏗️",
    titre: "Maçon / BTP",
    pays: ["🇫🇷 France", "🇧🇪 Belgique", "🇨🇭 Suisse"],
    salaire: "2 000 – 3 000 €/mois",
    tension: "Forte",
    tensionColor: "bg-orange-500 text-white",
    competences: ["Maçonnerie", "Coffrage", "Enduit"],
  },
  {
    emoji: "⚡",
    titre: "Électricien",
    pays: ["🇩🇪 Allemagne", "🇧🇪 Belgique", "🇨🇭 Suisse"],
    salaire: "2 200 – 3 200 €/mois",
    tension: "Forte",
    tensionColor: "bg-orange-500 text-white",
    competences: ["Installation électrique", "Câblage", "Habilitation"],
  },
  {
    emoji: "🏥",
    titre: "Infirmier(e)",
    pays: ["🇫🇷 France", "🇧🇪 Belgique", "🇨🇦 Canada"],
    salaire: "2 800 – 4 000 €/mois",
    tension: "Critique",
    tensionColor: "bg-red-500 text-white",
    competences: ["Diplôme infirmier", "Soins patients", "Urgences"],
  },
  {
    emoji: "📐",
    titre: "Topographe",
    pays: ["🇫🇷 France", "🇧🇪 Belgique", "🇨🇭 Suisse"],
    salaire: "2 500 – 3 500 €/mois",
    tension: "Modérée",
    tensionColor: "bg-yellow-400 text-gray-900",
    competences: ["Station totale", "AutoCAD", "SIG"],
  },
  {
    emoji: "👨‍🍳",
    titre: "Cuisinier",
    pays: ["🇱🇺 Luxembourg", "🇨🇭 Suisse", "🇫🇷 France"],
    salaire: "1 800 – 2 800 €/mois",
    tension: "Forte",
    tensionColor: "bg-orange-500 text-white",
    competences: ["Cuisine africaine/européenne", "Hygiène HACCP", "Gestion stock"],
  },
];

export default function MetiersAfrique() {
  return (
    <section className="bg-[#0D1F3C] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Titre */}
        <div className="text-center mb-10">
          <span className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest">🌍 TalentProof Global</span>
          <h2 className="text-white text-3xl md:text-4xl font-bold mt-2">Métiers en pénurie en Europe</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">Ces pays cherchent activement des talents africains. Ton métier est peut-être sur cette liste.</p>
        </div>

        {/* Grille métiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {METIERS.map((m) => (
            <div key={m.titre} className="bg-[#1B3A6B] border border-[#C9A84C]/60 shadow-xl shadow-black/30 rounded-2xl p-5 hover:bg-[#243E6E] transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-3xl">{m.emoji}</span>
                  <h3 className="text-white font-bold text-lg mt-1">{m.titre}</h3>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.tensionColor}`}>
                  {m.tension}
                </span>
              </div>

              {/* Salaire */}
              <p className="text-[#C9A84C] font-bold text-base mb-3">{m.salaire}</p>

              {/* Pays */}
              <div className="flex flex-wrap gap-1 mb-3">
                {m.pays.map((p) => (
                  <span key={p} className="text-white/80 text-xs bg-[#0D1F3C] border border-white/30 px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>

              {/* Compétences */}
              <div className="flex flex-wrap gap-1 mb-3">
                {m.competences.map((c) => (
                  <span key={c} className="text-[#C9A84C] text-xs bg-[#C9A84C]/15 border border-[#C9A84C]/50 px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>

              <p className="text-white/40 text-xs mt-2 italic">Conditions selon recruteur</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-white/70 text-sm mb-4">Tu as l&apos;un de ces métiers ? Crée ton profil et sois visible par les recruteurs européens.</p>
          <a href="/inscription" className="inline-block bg-[#C9A84C] hover:bg-[#b8933d] text-white font-bold px-8 py-3 rounded-full transition-colors">
            Créer mon profil gratuitement →
          </a>
        </div>
      </div>
    </section>
  );
}
