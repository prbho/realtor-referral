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
    // The visitor's local time is only known on the client. Computing this
    // during render would use the server's clock/timezone instead and cause
    // a mismatch between server- and client-rendered output, so it must be
    // deferred to an effect rather than computed synchronously during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(nextGreeting);
  }, []);

  return (
    <h1
      style={{ fontFamily: "var(--font-fraunces)" }}
      className="text-xl font-bold"
    >
      {greeting}, {name || "there"}!
    </h1>
  );
}
