"use client";

export default function Greeting({ name }: { name: string | null }) {
  // Compute greeting based on current hour (no effect needed)
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Get first name (split by space and take first part)
  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "there";
    return fullName.split(" ")[0];
  };

  return (
    <h1
      style={{ fontFamily: "var(--font-fraunces)" }}
      className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white"
    >
      {greeting}, {getFirstName(name)}! 👋
    </h1>
  );
}
