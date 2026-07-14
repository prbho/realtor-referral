"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { isValidEmail } from "@/lib/validation";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <Card className="w-full max-w-md mx-auto mt-10 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-xl transition-colors duration-300">
      <CardHeader className="space-y-1">
        <CardTitle>
          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            Sign In
          </h1>
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back! Sign in to manage your account.
        </p>

        {verified && (
          <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-md transition-colors duration-200">
            {completeProfile
              ? "Email verified! Sign in to finish setting up your profile."
              : "Email verified! You can now sign in."}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
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
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md transition-colors duration-200">
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
            <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-md transition-colors duration-200">
              {resendMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b3264] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
        <div className="text-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
          </span>
          <a
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Register
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
