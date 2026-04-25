"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Session {
  id: string;
  utilisateur_id: string;
  telephone: string;
}

interface Talent {
  id: string;
  utilisateur_id: string;
  prenom: string;
  nom: string;
  metier_principal: string | null;
  second_metier: string | null;
  secteur: string | null;
  niveau_experience: string | null;
  annees_experience: number | null;
  pays: string | null;
  ville: string | null;
  bio: string | null;
  titre_profil: string | null;
  description_courte: string | null;
  competences_principales: string | null;
  competences_secondaires: string | null;
  outils: string | null;
  avatar_url: string | null;
  video_presentation_url: string | null;
  has_video: boolean | null;
  preuve_url: string | null;
  cv_url: string | null;
  diplome_url: string | null;
  whatsapp: string | null;
}

interface MissingField {
  field: keyof Talent;
  label: string;
  points: number;
}

interface Suggestion {
  field: keyof Talent;
  value: string;
  label: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestion?: Suggestion;
  applied?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcScore(t: Talent): { score: number; missing: MissingField[] } {
  const missing: MissingField[] = [];
  let score = 0;
  if (t.avatar_url) score += 15;
  else missing.push({ field: "avatar_url", label: "Photo de profil", points: 15 });
  if (t.video_presentation_url || t.has_video) score += 20;
  else missing.push({ field: "video_presentation_url", label: "Vidéo de présentation", points: 20 });
  if (t.bio?.trim()) score += 10;
  else missing.push({ field: "bio", label: "Biographie", points: 10 });
  if (t.competences_principales?.trim()) score += 10;
  else missing.push({ field: "competences_principales", label: "Compétences principales", points: 10 });
  if (t.cv_url || t.diplome_url) score += 15;
  else missing.push({ field: "cv_url", label: "CV ou Diplôme", points: 15 });
  if (t.preuve_url) score += 15;
  else missing.push({ field: "preuve_url", label: "Photo de réalisation", points: 15 });
  if (t.whatsapp?.trim()) score += 5;
  else missing.push({ field: "whatsapp", label: "Numéro WhatsApp", points: 5 });
  if (t.metier_principal?.trim() && t.niveau_experience?.trim()) score += 10;
  else missing.push({ field: "metier_principal", label: "Informations de carrière", points: 10 });
  return { score, missing };
}

function getBadge(score: number) {
  if (score >= 71) return { label: "Or", emoji: "🥇", color: "#C9A84C" };
  if (score >= 41) return { label: "Argent", emoji: "🥈", color: "#9CA3AF" };
  return { label: "Bronze", emoji: "🥉", color: "#CD7F32" };
}

function parseSuggestion(raw: string): { display: string; suggestion?: Suggestion } {
  const bioMatch = raw.match(/===BIO_START===([\s\S]*?)===BIO_END===/);
  if (bioMatch) {
    return {
      display: raw.replace(/===BIO_START===[\s\S]*?===BIO_END===/, "").trim(),
      suggestion: { field: "bio", value: bioMatch[1].trim(), label: "Biographie" },
    };
  }
  const compMatch = raw.match(/===COMP_START===([\s\S]*?)===COMP_END===/);
  if (compMatch) {
    return {
      display: raw.replace(/===COMP_START===[\s\S]*?===COMP_END===/, "").trim(),
      suggestion: { field: "competences_principales", value: compMatch[1].trim(), label: "Compétences principales" },
    };
  }
  const titreMatch = raw.match(/===TITRE_START===([\s\S]*?)===TITRE_END===/);
  if (titreMatch) {
    return {
      display: raw.replace(/===TITRE_START===[\s\S]*?===TITRE_END===/, "").trim(),
      suggestion: { field: "titre_profil", value: titreMatch[1].trim(), label: "Titre de profil" },
    };
  }
  return { display: raw };
}

const QUICK_ACTIONS = [
  "Générer ma bio",
  "Suggérer mes compétences",
  "Proposer un titre de profil",
  "Que dois-je améliorer ?",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const router = useRouter();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Show toast temporarily
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load talent profile on mount
  useEffect(() => {
    const raw = localStorage.getItem("tp_talent");
    if (!raw) { router.replace("/connexion"); return; }

    let sess: Session;
    try {
      sess = JSON.parse(raw) as Session;
    } catch {
      router.replace("/connexion");
      return;
    }
    if (!sess.id) { router.replace("/connexion"); return; }

    supabase
      .from("talents")
      .select(`
        id, utilisateur_id,
        bio, titre_profil, description_courte,
        metier_principal, second_metier, secteur,
        niveau_experience, annees_experience,
        pays, ville,
        competences_principales, competences_secondaires, outils,
        avatar_url, video_presentation_url, has_video,
        preuve_url, cv_url, diplome_url,
        whatsapp,
        utilisateurs ( prenom, nom )
      `)
      .eq("id", sess.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.replace("/connexion"); return; }

        const u = data.utilisateurs as unknown as { prenom: string; nom: string } | null;
        const t: Talent = {
          ...data,
          prenom: u?.prenom ?? "",
          nom: u?.nom ?? "",
        };
        setTalent(t);
        setPageLoading(false);

        // Initial greeting from assistant
        const { missing } = calcScore(t);
        const greeting =
          missing.length > 0
            ? `Bonjour ${t.prenom} 👋 Je suis ton assistant TalentProof !\n\nJ'ai analysé ton profil — il te manque encore : **${missing.slice(0, 3).map((m) => m.label).join(", ")}**${missing.length > 3 ? ` et ${missing.length - 3} autre(s)` : ""}.\n\nPar quoi veux-tu commencer ?`
            : `Bravo ${t.prenom} 🎉 Ton profil est complet ! Je suis là si tu veux retravailler ta bio, tes compétences ou ton titre.`;
        setMessages([{ role: "assistant", content: greeting }]);
      });
  }, [router]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || !talent || sending) return;

      const userMsg: Message = { role: "user", content: text };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setSending(true);

      try {
        const { missing } = calcScore(talent);
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            profile: talent,
            missingFields: missing,
          }),
        });

        if (!res.ok) throw new Error("Erreur API");
        const json = await res.json();
        const { display, suggestion } = parseSuggestion(json.content ?? "");
        setMessages((prev) => [...prev, { role: "assistant", content: display, suggestion }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Désolé, une erreur s'est produite. Réessaie dans un instant." },
        ]);
      } finally {
        setSending(false);
      }
    },
    [messages, talent, sending]
  );

  const applySuggestion = async (idx: number) => {
    const msg = messages[idx];
    if (!msg.suggestion || !talent) return;
    setApplyingIdx(idx);

    const { error } = await supabase
      .from("talents")
      .update({ [msg.suggestion.field]: msg.suggestion.value })
      .eq("id", talent.id);

    if (!error) {
      setTalent((prev) =>
        prev ? { ...prev, [msg.suggestion!.field]: msg.suggestion!.value } : prev
      );
      setMessages((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, applied: true } : m))
      );
      showToast(`✓ ${msg.suggestion.label} sauvegardé dans ton profil !`);
    } else {
      showToast("❌ Erreur lors de la sauvegarde, réessaie.");
    }
    setApplyingIdx(null);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#EEF2F9" }}
      >
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${NAVY} transparent ${NAVY} ${NAVY}` }}
        />
      </div>
    );
  }

  if (!talent) return null;

  const { score, missing } = calcScore(talent);
  const badge = getBadge(score);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#EEF2F9" }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 shadow-md px-4 py-3 flex items-center justify-between"
        style={{ background: NAVY }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/60 hover:text-white text-sm leading-none">
            ←
          </Link>
          <span className="text-white font-bold text-base">🤖 Assistant TalentProof</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: badge.color, color: "#fff" }}
          >
            {badge.emoji} {badge.label}
          </span>
          <span className="text-white font-semibold text-sm">{score}/100</span>
        </div>
      </header>

      {/* ── Score card ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: NAVY }}>
              Complétion du profil
            </span>
            <span className="font-bold text-lg" style={{ color: GOLD }}>
              {score}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${score}%`,
                background: `linear-gradient(90deg, ${NAVY}, ${GOLD})`,
              }}
            />
          </div>
          {missing.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {missing.slice(0, 4).map((m) => (
                <span
                  key={m.field}
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ color: NAVY, borderColor: "#CBD5E1", background: "#F8FAFF" }}
                >
                  +{m.points}pts : {m.label}
                </span>
              ))}
              {missing.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  +{missing.length - 4} autres
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Assistant avatar */}
            {msg.role === "assistant" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 mb-0.5"
                style={{ background: NAVY }}
              >
                🤖
              </div>
            )}

            <div className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
              {/* Bubble */}
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                style={
                  msg.role === "user"
                    ? {
                        background: GOLD,
                        color: "#fff",
                        borderBottomRightRadius: 4,
                      }
                    : {
                        background: "#fff",
                        color: "#1e293b",
                        borderBottomLeftRadius: 4,
                        border: "1px solid #E0E8F5",
                      }
                }
              >
                {msg.content}
              </div>

              {/* Suggestion card */}
              {msg.suggestion && (
                <div
                  className="rounded-r-2xl p-3 shadow-sm w-full"
                  style={{
                    background: "#FFFBEB",
                    borderLeft: `4px solid ${GOLD}`,
                  }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wide mb-1.5"
                    style={{ color: GOLD }}
                  >
                    💡 Suggestion : {msg.suggestion.label}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {msg.suggestion.value}
                  </p>
                  {msg.applied ? (
                    <span className="text-xs font-semibold text-green-600">
                      ✓ Appliqué au profil
                    </span>
                  ) : (
                    <button
                      onClick={() => applySuggestion(idx)}
                      disabled={applyingIdx === idx}
                      className="text-xs font-bold px-4 py-1.5 rounded-full disabled:opacity-60 transition-opacity"
                      style={{ background: GOLD, color: "#fff" }}
                    >
                      {applyingIdx === idx ? "Sauvegarde…" : "Appliquer cette suggestion"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Talent avatar */}
            {msg.role === "user" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5"
                style={{ background: GOLD }}
              >
                {talent.prenom?.[0]?.toUpperCase() ?? "T"}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-2 items-end justify-start">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ background: NAVY }}
            >
              🤖
            </div>
            <div
              className="rounded-2xl px-4 py-3 shadow-sm flex gap-1 items-center"
              style={{ background: "#fff", border: "1px solid #E0E8F5", borderBottomLeftRadius: 4 }}
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: NAVY, animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick action chips ── */}
      <div className="px-4 pb-2">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => send(action)}
              disabled={sending}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-full border font-medium transition-all disabled:opacity-50 whitespace-nowrap hover:shadow-sm"
              style={{ borderColor: NAVY, color: NAVY, background: "#fff" }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 pb-3">
        <div
          className="bg-white rounded-2xl shadow-sm flex items-end gap-2 p-2"
          style={{ border: "1px solid #CBD5E1" }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
                if (textareaRef.current) textareaRef.current.style.height = "auto";
              }
            }}
            placeholder="Écris ta réponse… (Entrée pour envoyer)"
            className="flex-1 resize-none outline-none text-sm px-2 py-1.5 bg-transparent"
            style={{ color: "#1e293b", maxHeight: "112px", lineHeight: "1.5" }}
          />
          <button
            onClick={() => {
              send(input);
              if (textareaRef.current) textareaRef.current.style.height = "auto";
            }}
            disabled={sending || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: NAVY }}
            aria-label="Envoyer"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Finish button ── */}
      <div className="px-4 pb-6">
        <Link
          href={`/profil/${talent.id}`}
          className="block w-full text-center py-3 rounded-2xl font-bold text-sm shadow-sm transition-opacity hover:opacity-90"
          style={{ background: GOLD, color: "#fff" }}
        >
          Terminer et voir mon profil →
        </Link>
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50 pointer-events-none whitespace-nowrap"
          style={{ background: toast.startsWith("❌") ? "#DC2626" : "#16A34A" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
