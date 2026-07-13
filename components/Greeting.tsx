// components/Greeting.tsx
"use client";

import { useEffect, useState } from "react";

export default function Greeting({ name }: { name: string | null }) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    const nextGreeting =
      hour < 12
        ? "Good morning"
        : hour < 18
        ? "Good afternoon"
        : "Good evening";
    setGreeting(nextGreeting);
  }, []);

  // Get first name (split by space and take first part)
  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "there";
    return fullName.split(" ")[0];
  };

  return (
    <h1
      style={{ fontFamily: "var(--font-fraunces)" }}
      className="text-xl font-bold"
    >
      {greeting}, {getFirstName(name)}!
    </h1>
  );
}
