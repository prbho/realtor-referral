"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2, ArrowRight, ArrowLeft, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReferredByBannerProps {
  userId: string;
  onSuccess: () => void;
}

export default function ReferredByBanner({
  userId,
  onSuccess,
}: ReferredByBannerProps) {
  const router = useRouter();

  const getVisibilityState = () => {
    if (typeof window === "undefined") return { show: true, permanent: false };
    const permanent = localStorage.getItem(
      `referred-banner-permanent-${userId}`
    );
    if (permanent === "true") return { show: false, permanent: true };
    const dismissed = localStorage.getItem(
      `referred-banner-dismissed-${userId}`
    );
    return { show: dismissed !== "true", permanent: false };
  };

  const { show: initialShow, permanent: initialPermanent } =
    getVisibilityState();
  const [dismissed, setDismissed] = useState(!initialShow);
  const [permanentDeclined, setPermanentDeclined] = useState(initialPermanent);
  const [visible, setVisible] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!dismissed && !permanentDeclined) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [dismissed, permanentDeclined]);

  const handleYes = () => setShowInput(true);
  const handleBack = () => {
    setShowInput(false);
    setError(null);
  };

  const handleNo = () => {
    localStorage.setItem(`referred-banner-permanent-${userId}`, "true");
    localStorage.removeItem(`referred-banner-dismissed-${userId}`);
    setPermanentDeclined(true);
    setDismissed(true);
    setVisible(false);
    setTimeout(() => {
      onSuccess();
    }, 200);
  };

  const handleDismiss = () => {
    localStorage.setItem(`referred-banner-dismissed-${userId}`, "true");
    setDismissed(true);
    setVisible(false);
    setTimeout(() => {
      onSuccess();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      setError("Please enter a referral code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/claim-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode: referralCode.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to claim referral.");
      }

      if (data.userName) {
        setUserName(data.userName);
      }

      // Show the modal
      setSuccessModalOpen(true);

      // Dismiss the banner only AFTER the modal is shown
      // We'll hide the banner immediately but keep the modal
      setShowInput(false);
      localStorage.setItem(`referred-banner-permanent-${userId}`, "true");
      localStorage.removeItem(`referred-banner-dismissed-${userId}`);
      setPermanentDeclined(true);
      setDismissed(true);
      setVisible(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    onSuccess();
    router.refresh();
  };

  const firstName = userName?.split(" ")[0] || "";

  // Banner visibility
  const showBanner = !dismissed && !permanentDeclined;

  return (
    <>
      {showBanner && (
        <div
          className={`relative overflow-hidden rounded-xl p-4 flex items-start gap-3 transition-all duration-300 ease-out ${
            visible
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0 pointer-events-none"
          } bg-linear-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/20`}
        >
          <div className="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-emerald-400/30 dark:ring-emerald-500/30 animate-pulse" />

          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="absolute top-2 right-2 rounded-full p-1 text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-300 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="w-full flex-1">
            {showInput ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Back"
                    disabled={isLoading}
                    className="rounded-full p-1 -ml-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-200 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      Enter the referral code you received
                    </h2>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                      Link your account to your referrer.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. THEOPHUNV0"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    className="flex-1 tracking-wide border-emerald-300 dark:border-emerald-700 focus-visible:ring-emerald-500"
                    disabled={isLoading}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Claiming…
                      </>
                    ) : (
                      "Claim"
                    )}
                  </Button>
                </div>
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center animate-bounce">
                    <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                      👋 Were you referred by a Realtor?
                    </h2>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300/80">
                      If you joined through a friend or colleague, let us know
                      so we can credit them for the referral.
                    </p>
                    <div className="flex gap-3 mt-1">
                      <Button
                        variant="outline"
                        onClick={handleNo}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      >
                        No
                      </Button>
                      <Button
                        onClick={handleYes}
                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
                      >
                        Yes, I was referred
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Success Modal ────────────────────────────────────── */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Check className="h-5 w-5" />
              Referral Claimed! 🎉
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              {firstName ? (
                <>
                  Your referral has been successfully claimed,{" "}
                  <strong>{firstName}</strong>! The referrer has been credited
                  and you are now linked to them.
                </>
              ) : (
                <>
                  Your referral has been successfully claimed. The referrer has
                  been credited and you are now linked to them.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSuccessModalClose}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
