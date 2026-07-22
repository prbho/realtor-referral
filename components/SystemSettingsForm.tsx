"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Check, Loader2, ArrowLeft, Shield, Lock } from "lucide-react";

type Settings = {
  emailLimitEnabled: boolean;
  emailDailyLimit: number;
  ninVerificationRequired: boolean;
  registrationPaused: boolean;
  registrationPauseReason: string | null;
  registrationPauseUntil: string | null;
};

type TabId = "email" | "nin" | "registration";

export default function SystemSettingsForm({
  initialSettings,
  emailsSentToday,
}: {
  initialSettings: Settings;
  emailsSentToday: number;
}) {
  // ─── State with fallback defaults ────────────────────────────
  const [emailLimitEnabled, setEmailLimitEnabled] = useState(
    initialSettings.emailLimitEnabled ?? true
  );
  const [emailDailyLimit, setEmailDailyLimit] = useState(
    initialSettings.emailDailyLimit ?? 100
  );
  const [ninVerificationRequired, setNinVerificationRequired] = useState(
    initialSettings.ninVerificationRequired ?? true
  );
  const [registrationPaused, setRegistrationPaused] = useState(
    initialSettings.registrationPaused ?? false
  );
  const [registrationPauseReason, setRegistrationPauseReason] = useState(
    initialSettings.registrationPauseReason ?? ""
  );
  const [registrationPauseUntil, setRegistrationPauseUntil] = useState(
    initialSettings.registrationPauseUntil ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<TabId>("email");

  const percentUsed = Math.min(
    100,
    Math.round((emailsSentToday / emailDailyLimit) * 100)
  );
  const isNearLimit = percentUsed >= 80;

  // ─── Save handler ─────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailLimitEnabled,
          emailDailyLimit,
          ninVerificationRequired,
          registrationPaused,
          registrationPauseReason: registrationPauseReason.trim() || null,
          registrationPauseUntil: registrationPauseUntil || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings");
      } else {
        // ✅ Update local state with server response
        const s = data.settings;
        setEmailLimitEnabled(s.emailLimitEnabled);
        setEmailDailyLimit(s.emailDailyLimit);
        setNinVerificationRequired(s.ninVerificationRequired);
        setRegistrationPaused(s.registrationPaused);
        setRegistrationPauseReason(s.registrationPauseReason ?? "");
        setRegistrationPauseUntil(s.registrationPauseUntil ?? "");
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Tabs configuration ──────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "email", label: "Email Limits", icon: <Mail className="h-4 w-4" /> },
    {
      id: "nin",
      label: "NIN Verification",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: "registration",
      label: "Registration",
      icon: <Lock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-16 px-4 space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white transition-colors duration-200">
          System Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-gray-400 mt-1">
          Platform-wide feature toggles and limits.
        </p>
      </div>

      {/* ─── Card ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        {/* ─── Tab Bar ──────────────────────────────────────────── */}
        <div className="border-b border-gray-200 dark:border-neutral-700 px-4 pt-2">
          <nav
            className="flex gap-1 overflow-x-auto"
            aria-label="Settings tabs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ─── Tab Panels ───────────────────────────────────────── */}
        <div className="p-6 space-y-6">
          {/* Email tab */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-800 dark:text-white">
                    Daily Email Send Limit
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Protects against exceeding your email provider&apos;s daily
                    sending cap.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sent today
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      isNearLimit
                        ? "text-red-600 dark:text-red-400"
                        : "text-neutral-800 dark:text-white"
                    }`}
                  >
                    {emailsSentToday} / {emailDailyLimit}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isNearLimit ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable send limit protection
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When the daily limit is reached, registration, password
                    reset, and resend‑verification requests will show a
                    &quot;try again in 24 hours&quot; message instead of
                    attempting to send.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailLimitEnabled}
                  onChange={(e) => setEmailLimitEnabled(e.target.checked)}
                  className="h-5 w-5 shrink-0 ml-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </label>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Daily limit
                </label>
                <input
                  type="number"
                  min={1}
                  value={emailDailyLimit}
                  onChange={(e) =>
                    setEmailDailyLimit(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  disabled={!emailLimitEnabled}
                  className="w-32 p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Set this a little below your provider&apos;s actual cap (e.g.
                  95 if your limit is 100) to leave headroom.
                </p>
              </div>
            </div>
          )}

          {/* NIN tab */}
          {activeTab === "nin" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-800 dark:text-white">
                    NIN Verification Requirement
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Control whether users must verify their NIN to access
                    referral features.
                  </p>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Require NIN verification for referrals
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When enabled, users must verify their NIN via Monnify before
                    they can view or share their referral link and code. When
                    disabled, referral features are available to everyone.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={ninVerificationRequired}
                  onChange={(e) => setNinVerificationRequired(e.target.checked)}
                  className="h-5 w-5 shrink-0 ml-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </label>
            </div>
          )}

          {/* Registration tab */}
          {activeTab === "registration" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-800 dark:text-white">
                    Registration Pause
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Temporarily disable new user registrations. The registration
                    form will show a countdown timer and the reason you provide.
                  </p>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Pause new registrations
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When enabled, the registration page will block new sign‑ups
                    and display your reason and countdown until the specified
                    time.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={registrationPaused}
                  onChange={(e) => setRegistrationPaused(e.target.checked)}
                  className="h-5 w-5 shrink-0 ml-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </label>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Reason for pause
                  </label>
                  <textarea
                    value={registrationPauseReason}
                    onChange={(e) => setRegistrationPauseReason(e.target.value)}
                    disabled={!registrationPaused}
                    placeholder="e.g. System maintenance, we'll be back soon."
                    rows={2}
                    className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Pause until (date & time)
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationPauseUntil}
                    onChange={(e) => setRegistrationPauseUntil(e.target.value)}
                    disabled={!registrationPaused}
                    className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    If empty, the pause is indefinite (no countdown shown). The
                    countdown will show the remaining time from the
                    visitor&apos;s browser.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Error & Save ───────────────────────────────────── */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 disabled:cursor-not-allowed ${
                isSaved
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0b3264] text-white hover:bg-emerald-800 disabled:opacity-50"
              }`}
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <Loader2
                  className={`absolute h-4 w-4 animate-spin transition-opacity duration-150 ${
                    isSaving ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Check
                  className={`absolute h-4 w-4 transition-all duration-200 ${
                    isSaved ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                />
              </span>
              {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
