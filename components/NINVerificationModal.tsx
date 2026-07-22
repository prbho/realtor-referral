"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Check,
  AlertCircle,
  Shield,
  Fingerprint,
  Banknote,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface NINVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  currentNin: string | null;
}

export default function NINVerificationModal({
  isOpen,
  onClose,
  onVerified,
  currentNin,
}: NINVerificationModalProps) {
  const [nin, setNin] = useState(currentNin || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [roleUpdated, setRoleUpdated] = useState(false);
  const [newRole, setNewRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    const trimmed = nin.trim();
    if (!trimmed) {
      setError("Please enter your NIN.");
      return;
    }
    if (trimmed.length !== 11 || !/^\d{11}$/.test(trimmed)) {
      setError("NIN must be exactly 11 digits.");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccess(false);
    setRoleUpdated(false);
    setNewRole(null);

    try {
      const res = await fetch("/api/profile/verify-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("NIN verification error:", data);
        setError(data.error || "Verification failed. Please try again.");
      } else {
        setSuccess(true);
        if (data.fullName) setVerifiedName(data.fullName);
        if (data.roleUpdated) {
          setRoleUpdated(true);
          setNewRole(data.newRole);
        }
        setTimeout(() => {
          onVerified();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <Fingerprint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Verify Your NIN
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Powered by
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-xs font-semibold">
                <Image
                  src="/monnify.svg"
                  width={100}
                  height={100}
                  alt="Monnify"
                  className="w-4 h-4"
                />
                Monnify
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Enter your 11‑digit National Identification Number to unlock referral
          features and upgrade to a <strong>Realtor</strong> account.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <BadgeCheck className="h-4 w-4 text-blue-500" />
            <span>Encrypted</span>
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <Banknote className="h-4 w-4 text-emerald-500" />
            <span>PCI Compliant</span>
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <Shield className="h-4 w-4 text-amber-500" />
            <span>256‑bit SSL</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nin-modal" className="text-sm font-medium">
              National Identification Number
            </Label>
            <div className="relative mt-1">
              <Input
                id="nin-modal"
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                placeholder="12345678901"
                className="pr-10"
                disabled={isVerifying || success}
              />
              {nin.length === 11 && !error && !success && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {nin.length === 11 ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ Valid format
                </span>
              ) : (
                "Enter 11 digits, e.g. 12345678901"
              )}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 animate-in fade-in-50">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  NIN verified successfully with Monnify!
                </div>
                {verifiedName && (
                  <div className="text-xs font-medium">
                    Verified as:{" "}
                    <span className="font-semibold">{verifiedName}</span>
                  </div>
                )}
                {roleUpdated && newRole && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">
                    <Sparkles className="h-4 w-4" />
                    You are now a <span className="uppercase">{newRole}</span>!
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isVerifying && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Contacting Monnify...
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
            <Button variant="outline" onClick={onClose} disabled={isVerifying}>
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || success || nin.length !== 11}
              className="min-w-30"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Verified
                </>
              ) : (
                "Verify NIN"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
