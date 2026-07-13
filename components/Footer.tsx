// app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-950 mt-auto transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          &copy; {year} Regal PDC Ltd. All rights reserved.
        </p>

        <nav className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          <Link
            href="/dashboard"
            className="hover:text-neutral-800 dark:hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="hover:text-neutral-800 dark:hover:text-white transition-colors duration-200"
          >
            Profile
          </Link>
          <a
            href="mailto:support@example.com"
            className="hover:text-neutral-800 dark:hover:text-white transition-colors duration-200"
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}
