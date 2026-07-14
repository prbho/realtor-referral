"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  bg?: string;
  copyable?: boolean;
  copyValue?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  change,
  bg,
  copyable = false,
  copyValue,
}: StatCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (copyValue) {
      try {
        await navigator.clipboard.writeText(copyValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div
      className={`${
        bg || "bg-white dark:bg-slate-800"
      } rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {label}
          </span>
        </div>
        {copyable && copyValue && (
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Copy"
          >
            {copied ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                Copied!
              </span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
        {change && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
