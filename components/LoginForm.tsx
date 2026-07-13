// app/login/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { isValidEmail } from "@/lib/validation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const completeProfile = searchParams.get("completeProfile");
  const callbackUrl =
    searchParams.get("callbackUrl") ||
    (completeProfile ? "/profile" : "/dashboard");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setResendMessage("");
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setResendMessage(
        res.ok ? data.message : data.error || "Something went wrong"
      );
    } catch {
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setResendMessage("");

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("Too many")) {
          setError(result.error);
        } else if (result.error === "EmailNotVerified") {
          setError(
            "Please verify your email before signing in — check your inbox for the link."
          );
          setShowResend(true);
        } else {
          setError("Invalid email or password");
        }
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 bg-white dark:bg-slate-800 shadow-md transition-colors duration-200 bg-linear-to-br from-[#0b3264] to-slate-800 rounded-3xl p-12 text-white dark:from-[#0b3264] dark:to-slate-900">
      <CardHeader>
        <CardTitle>
          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-2xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Sign In
          </h1>
        </CardTitle>

        {verified && (
          <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 p-2 rounded mb-4 transition-colors duration-200">
            {completeProfile
              ? "Email verified! Sign in to finish setting up your profile."
              : "Email verified! You can now sign in."}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded transition-colors duration-200">
              {error}
              {showResend && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend verification email"}
                  </button>
                </div>
              )}
            </div>
          )}

          {resendMessage && (
            <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 p-2 rounded transition-colors duration-200">
              {resendMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b3264] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 bg-transparent">
        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
          </span>
          <a
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Register
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
