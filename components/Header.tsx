"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

// ─── UserAvatar (static, defined outside render) ──────────────
function UserAvatar({
  src,
  name,
  size = 32,
}: {
  src: string | null;
  name: string | null;
  size?: number;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "Avatar"}
        width={size}
        height={size}
        className="inline-block rounded-full object-cover shrink-0 aspect-square"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

// ─── Main Header Component ────────────────────────────────────
export default function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe role check
  const userRole = (session?.user as { role?: string } | undefined)?.role || "";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-[#0d1117]/90 dark:backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Image
            src="/regal-pdc-ltd-logo.webp"
            loading="eager"
            priority
            width={200}
            height={100}
            alt="Regal PDC Realtors"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Right side navigation */}
        <nav className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="h-9 w-9 rounded-full overflow-hidden bg-[#0b3264] dark:bg-slate-700 text-white flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 transition-all duration-200 focus:outline-none"
                aria-label="User menu"
                aria-expanded={isOpen}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
              >
                <UserAvatar
                  src={session.user.image ?? null}
                  name={session.user.name ?? null}
                />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl shadow-xl py-1 transition-all duration-200 origin-top-right scale-100 opacity-100">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200/50 dark:border-slate-700/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>

                  {/* Navigation links */}
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    Settings
                  </Link>
                  {userRole === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      Admin
                    </Link>
                  )}

                  <div className="border-t border-gray-200/50 dark:border-slate-700/50 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-[#0b3264] dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors duration-200"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
