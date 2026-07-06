"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-3 py-2 bg-gray-200 text-neutral-700 rounded-md hover:bg-gray-300 text-sm"
    >
      Sign Out
    </button>
  );
}
