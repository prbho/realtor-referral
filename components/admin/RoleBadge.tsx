// components/admin/RoleBadge.tsx
const roleBadgeColor = (role: string) =>
  role === "ADMIN"
    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    : role === "REALTOR"
    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    : "bg-gray-100 dark:bg-neutral-700 text-neutral-600 dark:text-gray-300";

interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadgeColor(
        role
      )}`}
    >
      {role}
    </span>
  );
}
