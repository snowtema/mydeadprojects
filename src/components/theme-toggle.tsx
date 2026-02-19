"use client";

import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

const LABELS: Record<string, string> = {
  dark: "Dark",
  light: "Light",
  auto: "System",
};

export function ThemeToggle() {
  const { setting, cycleSetting } = useTheme();
  const [hovering, setHovering] = useState(false);

  const icon =
    setting === "light" ? (
      <Sun size={14} strokeWidth={1.5} />
    ) : setting === "dark" ? (
      <Moon size={14} strokeWidth={1.5} />
    ) : (
      <Monitor size={14} strokeWidth={1.5} />
    );

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        onClick={cycleSetting}
        className="p-1.5 text-text-muted hover:text-text-dim transition-colors cursor-pointer"
        aria-label={`Theme: ${LABELS[setting]}. Click to switch.`}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <div
        className={`absolute top-full right-0 mt-1.5 px-2 py-1 bg-bg-card border border-border rounded text-[0.6rem] text-text-dim whitespace-nowrap pointer-events-none transition-opacity duration-150 ${
          hovering ? "opacity-100" : "opacity-0"
        }`}
      >
        {LABELS[setting]}
      </div>
    </div>
  );
}
