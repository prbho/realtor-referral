// components/admin/ModalShell.tsx
import { ReactNode } from "react";

interface ModalShellProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function ModalShell({
  isVisible,
  onClose,
  children,
  className = "",
}: ModalShellProps) {
  return (
    <div
      className={`fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-150 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col transition-all duration-150 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
