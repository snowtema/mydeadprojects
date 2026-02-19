"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type ThemeSetting = "dark" | "light" | "auto";

interface ThemeContextValue {
  setting: ThemeSetting;
  resolved: "dark" | "light";
  cycleSetting: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  setting: "auto",
  resolved: "dark",
  cycleSetting: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const CYCLE: ThemeSetting[] = ["dark", "light", "auto"];

function resolveTheme(
  setting: ThemeSetting,
  systemDark: boolean
): "dark" | "light" {
  if (setting === "auto") return systemDark ? "dark" : "light";
  return setting;
}

function applyResolved(resolved: "dark" | "light") {
  if (resolved === "light") {
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [setting, setSetting] = useState<ThemeSetting>("auto");
  const [systemDark, setSystemDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // On mount: read stored setting + system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeSetting | null;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = mq.matches;

    setSystemDark(isDark);

    if (stored === "dark" || stored === "light") {
      setSetting(stored);
    } else {
      // stored is null or "auto"
      setSetting("auto");
    }

    setMounted(true);

    // Listen for system theme changes (affects "auto" mode)
    function onChange(e: MediaQueryListEvent) {
      setSystemDark(!e.matches);
      // We need the opposite check — matchMedia is for dark
      setSystemDark(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Apply class whenever setting or system preference changes
  useEffect(() => {
    if (!mounted) return;
    applyResolved(resolveTheme(setting, systemDark));
  }, [setting, systemDark, mounted]);

  const cycleSetting = useCallback(() => {
    setSetting((prev) => {
      const idx = CYCLE.indexOf(prev);
      const next = CYCLE[(idx + 1) % CYCLE.length];
      try {
        if (next === "auto") {
          localStorage.removeItem("theme");
        } else {
          localStorage.setItem("theme", next);
        }
      } catch {}
      return next;
    });
  }, []);

  const resolved = resolveTheme(setting, systemDark);

  const value: ThemeContextValue = {
    setting: mounted ? setting : "auto",
    resolved: mounted ? resolved : "dark",
    cycleSetting,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
