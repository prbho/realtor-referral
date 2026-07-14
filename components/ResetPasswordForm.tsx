"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidPassword } from "@/lib/validation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing or invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message || "Invalid password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If token is missing, show an error state inside the same card
  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-xl transition-colors duration-300">
        <CardHeader>
          <CardTitle>
            <h1
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              Reset Password
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
            Invalid or missing reset link.
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
          <a
            href="/forgot-password"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
          >
            Request a new link
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-xl transition-colors duration-300">
      <CardHeader className="space-y-1">
        <CardTitle>
          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            Reset Password
          </h1>
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your new password below.
        </p>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-md transition-colors duration-200">
            Password updated successfully! Redirecting to sign in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                At least 8 characters, one uppercase letter, one number.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                required
              />
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
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
