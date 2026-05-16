"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tp_pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg text-white"
        style={{ backgroundColor: "#1B3A6B" }}
      >
        <span className="text-2xl shrink-0">📱</span>
        <p className="text-sm font-medium flex-1 leading-snug">
          Installer TalentProof sur votre téléphone
        </p>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C9A84C" }}
          >
            Installer
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white/90 transition-colors text-center"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
