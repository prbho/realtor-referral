// app/loading.tsx
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-24 w-48 items-center justify-center overflow-hidden">
          <Image
            src="/loading.webp"
            alt="Regal PDC Realtor"
            width={240}
            height={96}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
