// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Spinner */}
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-neutral-700 border-t-[#0b3264] dark:border-t-[#0b3264] animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
