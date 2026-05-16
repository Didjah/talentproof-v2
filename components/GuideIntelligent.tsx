"use client";

import { useState } from "react";

const NAVY = "#1B3A6B";
const GOLD  = "#C9A84C";

type GuideEntry = {
  competences: string[];
  description_modele: string;
  conseils: string[];
};

const GUIDES_METIERS: Record<string, GuideEntry> = {
  "Chauffeur": {
    competences: ["Conduite poids lourd", "Navigation GPS", "Gestion des livraisons", "Entretien véhicule"],
    description_modele: "Chauffeur expérimenté avec X ans d'expérience en transport de marchandises et personnes. Maîtrise de la conduite en milieu urbain et interurbain.",
    conseils: ["Ajoutez une photo en uniforme ou devant votre véhicule", "Mentionnez vos types de permis (A, B, C, D)", "Précisez les tonnages et zones desservies"],
  },
  "Chauffeur-livreur": {
    competences: ["Conduite véhicule léger", "Livraison express", "Navigation GPS", "Relation client"],
    description_modele: "Chauffeur-livreur professionnel avec expérience en livraison rapide et service client de qualité.",
    conseils: ["Photo devant votre véhicule", "Mentionnez vos zones de couverture", "Précisez votre bilan sans accident"],
  },
  "Mécanicien": {
    competences: ["Diagnostic moteur", "Réparation freins", "Vidange et entretien", "Soudure auto"],
    description_modele: "Mécanicien polyvalent spécialisé en entretien et réparation de véhicules légers et poids lourds.",
    conseils: ["Photographiez vos réalisations (moteurs, carrosserie)", "Listez les marques maîtrisées", "Mentionnez vos outils de diagnostic"],
  },
  "Électricien": {
    competences: ["Installation électrique", "Câblage tableau", "Dépannage résidentiel", "Lecture de plans"],
    description_modele: "Électricien qualifié spécialisé en installation et dépannage électrique résidentiel et industriel.",
    conseils: ["Montrez des photos de vos installations", "Précisez votre niveau (résidentiel/industriel)", "Mentionnez vos certifications"],
  },
  "Maçon": {
    competences: ["Maçonnerie", "Pose carrelage", "Coffrage béton", "Enduit façade"],
    description_modele: "Maçon expérimenté en construction et rénovation de bâtiments résidentiels et commerciaux.",
    conseils: ["Photos avant/après de chantiers", "Précisez les types de construction", "Mentionnez vos chantiers importants"],
  },
  "Couturier / Tailleur": {
    competences: ["Couture sur mesure", "Confection africaine", "Retouche vêtements", "Broderie"],
    description_modele: "Couturier(ère) spécialisé(e) en confection sur mesure et tenues africaines traditionnelles et modernes.",
    conseils: ["Photos de vos créations les plus belles", "Mentionnez les tissus maîtrisés", "Précisez vos délais de confection"],
  },
  "Chef cuisinier": {
    competences: ["Cuisine africaine", "Pâtisserie", "Gestion de cuisine", "Hygiène alimentaire HACCP"],
    description_modele: "Cuisinier professionnel spécialisé en cuisine africaine et internationale avec expérience en restauration.",
    conseils: ["Photos de vos plats signature", "Mentionnez vos spécialités régionales", "Ajoutez vos expériences en restaurant/traiteur"],
  },
  "Plombier": {
    competences: ["Installation sanitaire", "Réparation fuites", "Pose robinetterie", "Soudure cuivre"],
    description_modele: "Plombier qualifié avec expérience en installation et dépannage de réseaux sanitaires résidentiels et commerciaux.",
    conseils: ["Photos de vos installations", "Mentionnez votre disponibilité d'urgence", "Précisez les types d'interventions"],
  },
  "Développeur web / mobile": {
    competences: ["JavaScript / TypeScript", "React / React Native", "Node.js / Python", "Bases de données SQL"],
    description_modele: "Développeur web et mobile avec expérience en création d'applications modernes et performantes pour des clients africains et internationaux.",
    conseils: ["Ajoutez un lien vers votre portfolio ou GitHub", "Listez vos projets réalisés avec leurs technologies", "Précisez votre stack technique préféré"],
  },
  "Coiffeur / Coiffeuse": {
    competences: ["Coupe femme / homme", "Tressage africain", "Défrisage et lissage", "Coloration"],
    description_modele: "Coiffeur(se) professionnel(le) spécialisé(e) en coiffures africaines et européennes avec X ans d'expérience en salon.",
    conseils: ["Photos avant/après de vos clients", "Mentionnez vos spécialités (tresses, locks)", "Précisez votre lieu de travail"],
  },
  "Agent de sécurité / Gardien": {
    competences: ["Surveillance et contrôle", "Gestion des incidents", "Premiers secours", "Rapport de rondes"],
    description_modele: "Agent de sécurité expérimenté avec X ans dans la surveillance de sites résidentiels, commerciaux et événementiels.",
    conseils: ["Photo en uniforme professionnel", "Mentionnez vos certifications de sécurité", "Précisez les types de sites gardés"],
  },
  "default": {
    competences: [],
    description_modele: "Professionnel expérimenté avec une solide expertise dans mon domaine et une capacité d'adaptation éprouvée.",
    conseils: ["Ajoutez une photo professionnelle de qualité", "Décrivez vos principales réalisations concrètes", "Mentionnez vos années d'expérience et vos spécialités"],
  },
};

interface Props {
  metier: string;
  etape: number;
  score: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideIntelligent({ metier, etape, score, isOpen, onClose }: Props) {
  const [copie, setCopie] = useState<string | null>(null);

  const guide = GUIDES_METIERS[metier] ?? GUIDES_METIERS["default"];
  const scoreLabel = score <= 40 ? "🥉 Bronze" : score <= 70 ? "🥈 Argent" : "🥇 Or";
  const scoreColor = score <= 40 ? "#EF4444" : score <= 70 ? "#F97316" : "#22C55E";
  const prochainNiveau = score <= 40 ? "Argent" : score <= 70 ? "Or" : null;

  async function copier(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopie(key);
    setTimeout(() => setCopie(null), 2000);
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-white shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ backgroundColor: NAVY }}>
            <div>
              <p className="text-white font-bold text-sm">
                💡 Guide — {metier || "Choisissez un métier"}
              </p>
              <p className="text-white/60 text-xs mt-0.5">Étape {etape + 1} sur 5</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl leading-none transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Score mini */}
          <div className="px-5 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-medium">Score actuel</span>
              <span className="text-xs font-bold" style={{ color: scoreColor }}>
                {scoreLabel} — {score}/100
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, backgroundColor: scoreColor }}
              />
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

            {/* Compétences suggérées */}
            {guide.competences.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  ✅ Compétences suggérées
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.competences.map((c) => (
                    <button
                      key={c}
                      onClick={() => copier(c, c)}
                      className="text-xs font-semibold rounded-full px-3 py-1.5 border-2 transition-all duration-200"
                      style={{
                        borderColor: GOLD,
                        color: copie === c ? "white" : GOLD,
                        backgroundColor: copie === c ? GOLD : "transparent",
                      }}
                      title="Cliquer pour copier"
                    >
                      {copie === c ? "✓ Copié" : c}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Cliquez sur un chip pour le copier
                </p>
              </div>
            )}

            {/* Description modèle */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                📝 Description modèle
              </p>
              <div className="bg-[#f4f7fb] rounded-xl p-4 text-xs text-gray-700 leading-relaxed border border-gray-200 italic">
                &ldquo;{guide.description_modele}&rdquo;
              </div>
              <button
                onClick={() => copier(guide.description_modele, "desc")}
                className="mt-2 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                style={{ color: copie === "desc" ? "#22C55E" : NAVY }}
              >
                {copie === "desc" ? "✓ Copié !" : "📋 Copier cette description"}
              </button>
            </div>

            {/* Conseils */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                💡 Conseils pour ce métier
              </p>
              <ul className="flex flex-col gap-3">
                {guide.conseils.map((conseil, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                    <span className="font-bold shrink-0 mt-0.5" style={{ color: GOLD }}>✓</span>
                    {conseil}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prochain niveau */}
            {prochainNiveau && (
              <div
                className="rounded-xl border-2 border-dashed p-4"
                style={{ borderColor: GOLD + "60" }}
              >
                <p className="text-xs font-bold mb-1.5" style={{ color: NAVY }}>
                  🎯 Pour atteindre le niveau {prochainNiveau === "Argent" ? "🥈 Argent" : "🥇 Or"}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {prochainNiveau === "Argent"
                    ? "Ajoutez vos compétences (+10 pts), un document (+15 pts) et complétez votre bio (+10 pts)."
                    : "Ajoutez une vidéo de présentation (+20 pts) et une photo de réalisation (+15 pts)."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
