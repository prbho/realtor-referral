// components/admin/DetailRow.tsx
interface DetailRowProps {
  label: string;
  value: string | null;
}

export default function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-neutral-800 dark:text-white">{value || "—"}</p>
    </div>
  );
}
