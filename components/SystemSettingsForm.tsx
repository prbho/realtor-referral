// app/admin/settings/SystemSettingsForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Check, Loader2, ArrowLeft } from "lucide-react";

type Settings = {
  emailLimitEnabled: boolean;
  emailDailyLimit: number;
};

export default function SystemSettingsForm({
  initialSettings,
  emailsSentToday,
}: {
  initialSettings: Settings;
  emailsSentToday: number;
}) {
  const [emailLimitEnabled, setEmailLimitEnabled] = useState(
    initialSettings.emailLimitEnabled
  );
  const [emailDailyLimit, setEmailDailyLimit] = useState(
    initialSettings.emailDailyLimit
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  const percentUsed = Math.min(
    100,
    Math.round((emailsSentToday / emailDailyLimit) * 100)
  );
  const isNearLimit = percentUsed >= 80;

  const handleSave = async () => {
    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailLimitEnabled, emailDailyLimit }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings");
      } else {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-16 px-4 space-y-6">
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
          Platform-wide feature toggles.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-4">
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

        {/* Today's usage */}
        <div className="mb-5 p-4 rounded-lg bg-gray-50 dark:bg-neutral-900/50">
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

        {/* Toggle */}
        <label className="flex items-center justify-between cursor-pointer mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Enable send limit protection
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When the daily limit is reached, registration, password reset, and
              resend-verification requests will show a &quot;try again in 24
              hours&quot; message instead of attempting to send.
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailLimitEnabled}
            onChange={(e) => setEmailLimitEnabled(e.target.checked)}
            className="h-5 w-5 shrink-0 ml-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </label>

        {/* Limit input */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Daily limit
          </label>
          <input
            type="number"
            min={1}
            value={emailDailyLimit}
            onChange={(e) =>
              setEmailDailyLimit(Math.max(1, parseInt(e.target.value) || 1))
            }
            disabled={!emailLimitEnabled}
            className="w-32 p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Set this a little below your provider&apos;s actual cap (e.g. 95 if
            your limit is 100) to leave headroom.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded mt-3">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 disabled:cursor-not-allowed ${
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
  );
}
