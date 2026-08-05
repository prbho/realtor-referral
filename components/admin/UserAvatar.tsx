// components/admin/UserAvatar.tsx
import Image from "next/image";

interface UserAvatarProps {
  src: string | null;
  name: string | null;
  size?: number;
}

function normalizeAvatarSrc(src: string) {
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }

  const domainLike = /^[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d+)?\//;
  if (domainLike.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  return trimmed;
}

export default function UserAvatar({ src, name, size = 32 }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (src) {
    const safeSrc = normalizeAvatarSrc(src);

    return (
      <Image
        src={safeSrc}
        alt={name || "Avatar"}
        width={size}
        height={size}
        className="inline-block rounded-full object-cover shrink-0 aspect-square"
        unoptimized
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}
