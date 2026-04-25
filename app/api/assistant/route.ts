import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, profile, missingFields } = await req.json();

    const profileText = profile
      ? [
          `Prénom: ${profile.prenom || "-"}`,
          `Nom: ${profile.nom || "-"}`,
          `Métier principal: ${profile.metier_principal || "Non renseigné"}`,
          `Second métier: ${profile.second_metier || "-"}`,
          `Secteur: ${profile.secteur || "-"}`,
          `Niveau d'expérience: ${profile.niveau_experience || "-"} (${profile.annees_experience || 0} ans)`,
          `Pays: ${profile.pays || "-"}, Ville: ${profile.ville || "-"}`,
          `Compétences principales: ${profile.competences_principales || "Non renseignées"}`,
          `Titre profil: ${profile.titre_profil || "Non renseigné"}`,
          `Bio: ${profile.bio ? profile.bio.substring(0, 120) + "…" : "Non renseignée"}`,
        ].join("\n")
      : "Non disponible";

    const missingText =
      missingFields?.length > 0
        ? missingFields.map((m: { label: string }) => m.label).join(", ")
        : "Aucun champ manquant";

    const systemPrompt = `Tu es un assistant TalentProof qui aide les travailleurs africains à compléter leur profil professionnel sur la plateforme TalentProof.

Directives :
- Tu poses des questions simples, claires et progressives, une seule question à la fois
- Tu proposes des exemples concrets adaptés au contexte africain (Guinée, Sénégal, Côte d'Ivoire, Mali, Cameroun, Burkina Faso, etc.)
- Tu génères des bios professionnelles courtes et percutantes (2-3 phrases maximum) selon le métier
- Tu suggères des compétences typiques, concrètes et pertinentes selon le métier et le secteur
- Tes réponses sont courtes, directes et chaleureuses
- Tu es encourageant et positif

FORMAT SPÉCIAL POUR LES SUGGESTIONS APPLICABLES :
- Quand tu génères une bio complète à sauvegarder : encadre-la avec ===BIO_START=== et ===BIO_END===
- Quand tu génères une liste de compétences à sauvegarder : encadre-les avec ===COMP_START=== et ===COMP_END=== (séparées par des virgules)
- Quand tu proposes un titre de profil à sauvegarder : encadre-le avec ===TITRE_START=== et ===TITRE_END===
- Ces marqueurs permettent à l'utilisateur d'appliquer la suggestion en un clic

Profil actuel du talent :
${profileText}

Champs manquants pour améliorer le score : ${missingText}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ type: "unknown" }));
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content[0].text });
  } catch (err) {
    console.error("Assistant API error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
