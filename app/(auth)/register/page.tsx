// app/(auth)/register/page.tsx
import RegisterForm from "@/components/RegisterForm";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
