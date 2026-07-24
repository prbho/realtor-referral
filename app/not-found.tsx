import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300">
          404
        </p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          The page you requested does not exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-[#0b3264] px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
