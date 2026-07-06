// app/components/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const isFirstRender = useRef(true);

  // Function to apply theme
  const applyTheme = (themeChoice: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (themeChoice === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const resolved = prefersDark ? "dark" : "light";
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    } else {
      root.classList.add(themeChoice);
      setResolvedTheme(themeChoice);
    }
  };

  // Load saved theme on mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // Try to get theme from localStorage
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      const initialTheme = savedTheme || "system";

      setThemeState(initialTheme);
      applyTheme(initialTheme);
      setMounted(true);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
