"use client";

export default function GlobalError({ reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Please try again. If the problem continues, contact support.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-[#0b3264] px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
