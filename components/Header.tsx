// app/components/Header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

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

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="transition-colors duration-200">
          <Image
            src="/regal-pdc-ltd-logo.webp"
            loading="eager"
            priority
            width={200}
            height={100}
            alt="Regal PDC Realtors"
          />
        </Link>

        <nav className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="h-9 w-9 rounded-full overflow-hidden bg-[#0b3264] text-white flex items-center justify-center text-sm font-semibold hover:opacity-90 transition"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md shadow-lg py-1 transition-colors duration-200">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-700">
                    <p className="text-sm font-medium text-neutral-800 dark:text-white truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    Settings
                  </Link>
                  {(session.user as unknown as { role: string }).role ===
                    "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                    >
                      Admin
                    </Link>
                  )}

                  <div className="border-t border-gray-200 dark:border-neutral-700 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors duration-200"
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
                className="text-sm font-medium text-neutral-600 dark:text-gray-300 hover:text-neutral-800 dark:hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-[#0b3264] text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
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
