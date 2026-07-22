"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import { Eye, EyeOff, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    referralCode: referralCode || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referrerLoading, setReferrerLoading] = useState(!!referralCode);
  const [showPassword, setShowPassword] = useState(false);

  // Registration pause state
  const [regPaused, setRegPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<string | null>(null);
  const [pauseUntil, setPauseUntil] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Fetch registration status
  useEffect(() => {
    fetch("/api/auth/registration-status")
      .then((res) => res.json())
      .then((data) => {
        setRegPaused(data.paused);
        setPauseReason(data.reason);
        setPauseUntil(data.pauseUntil);
      })
      .catch(() => {});
  }, []);

  // Countdown timer – fixed to avoid setState in effect body
  useEffect(() => {
    // If no pause is active, clear any interval and reset timeLeft (handled by cleanup)
    if (!regPaused || !pauseUntil) {
      // timeLeft will be set to null by cleanup if an interval was running
      return;
    }

    const updateTimeLeft = () => {
      const now = Date.now();
      const target = new Date(pauseUntil).getTime();
      const diff = target - now;

      if (diff <= 0) {
        // Pause expired – refresh status
        fetch("/api/auth/registration-status")
          .then((res) => res.json())
          .then((data) => {
            setRegPaused(data.paused);
            setPauseReason(data.reason);
            setPauseUntil(data.pauseUntil);
          })
          .catch(() => {});
        clearInterval(intervalId);
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    const intervalId = setInterval(updateTimeLeft, 1000);
    // Call immediately to set initial value
    updateTimeLeft();

    return () => {
      clearInterval(intervalId);
      // Reset timeLeft when interval stops (pause ended or component unmounts)
      setTimeLeft(null);
    };
  }, [regPaused, pauseUntil]);

  // Fetch referrer name (unchanged)
  useEffect(() => {
    if (!referralCode) return;
    let cancelled = false;
    fetch(`/api/referrer?code=${encodeURIComponent(referralCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setReferrerName(data?.name || null);
      })
      .catch(() => {
        if (!cancelled) setReferrerName(null);
      })
      .finally(() => {
        if (!cancelled) setReferrerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (regPaused) {
      setError("Registration is currently paused.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const passwordCheck = isValidPassword(formData.password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message || "Invalid password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Server returned invalid response");
      }

      if (!response.ok) {
        if (response.status === 503 && data.pauseReason) {
          setRegPaused(true);
          setPauseReason(data.pauseReason);
          setPauseUntil(data.pauseUntil);
          setError(data.error || "Registration is paused.");
        } else {
          throw new Error(data.error || "Registration failed");
        }
      } else {
        setSuccess(
          data.message ||
            "Account created! Please check your email to verify your account."
        );
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || regPaused;

  return (
    <Card className="w-full max-w-md mx-auto mt-10 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-xl transition-colors duration-300">
      <CardHeader className="space-y-1">
        <CardTitle>
          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            Create Account
          </h1>
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Join the network and start earning commissions.
        </p>

        {referralCode && (
          <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-md transition-colors duration-200">
            {referrerLoading
              ? "Checking referral..."
              : referrerName
              ? `🎉 You were referred by ${referrerName}`
              : "Referral code applied"}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-md transition-colors duration-200">
            {success}
          </div>
        ) : regPaused ? (
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
              <p className="text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Registration is temporarily paused
              </p>
              {pauseReason && (
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {pauseReason}
                </p>
              )}
              {timeLeft && (
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 font-mono">
                  Resumes in {timeLeft.hours}h {timeLeft.minutes}m{" "}
                  {timeLeft.seconds}s
                </p>
              )}
              {!pauseUntil && (
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                  No resumption time set – check back later.
                </p>
              )}
            </div>
            <button
              disabled
              className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium py-2.5 px-4 rounded-md cursor-not-allowed"
            >
              Registration disabled
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2.5 pr-10 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                At least 8 characters, one uppercase letter, one number.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md transition-colors duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full bg-[#0b3264] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
        <div className="text-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
          </span>
          <a
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
