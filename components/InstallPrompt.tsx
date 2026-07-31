"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_COOLDOWN_DAYS = 7;

// ─── Type for the beforeinstallprompt event ──────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();

      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const daysSince =
          (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSince < DISMISS_COOLDOWN_DAYS) return;
      }

      setDeferredPrompt(event);
      setShowPrompt(true);
      requestAnimationFrame(() => setTimeout(() => setVisible(true), 50));
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setTimeout(() => setShowPrompt(false), 200);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setVisible(false);
        setTimeout(() => setShowPrompt(false), 200);
      } else {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      }
    } catch (error) {
      console.error("Install prompt failed", error);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install app"
      aria-live="polite"
      className={`fixed inset-x-4 z-50 transition-all duration-300 ease-out sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex gap-6 relative overflow-hidden rounded-xl border border-slate-200/5 dark:border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2.5 right-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-24 w-24 shrink-0 items-center justify-center">
          <Image
            width={180}
            height={155}
            alt="Regal PDC Realtors"
            src="/icons/icon-512.png"
            loading="eager"
            priority
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white dark:text-white">
            Install the app
          </p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-400">
            Add it to your home screen for faster access and a full-screen
            experience.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="text-xs font-medium bg-[#0b3264] text-white px-3.5 py-2 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none"
            >
              {installing ? "Installing…" : "Install"}
            </button>
            <button
              onClick={dismiss}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
