// components/CopyButton.tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex shrink-0  items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        copied
          ? "bg-emerald-600 text-white"
          : "bg-[#0b3264] text-white hover:bg-blue-700"
      }`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Copy
          className={`absolute h-4 w-4 transition-all duration-200 ${
            copied
              ? "opacity-0 scale-50 rotate-12"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />
        <Check
          className={`absolute h-4 w-4 transition-all duration-200 ${
            copied
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-50 -rotate-12"
          }`}
        />
      </span>
      <span className="min-w-10 text-left">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
