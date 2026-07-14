"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isValidEmail, isValidPassword } from "@/lib/validation";
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
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(
        data.message ||
          "Account created! Please check your email to verify your account."
      );
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
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
              disabled={isLoading}
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
