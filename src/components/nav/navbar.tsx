"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type User } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { TombstoneIcon } from "@/components/icons";

interface NavbarProps {
  user?: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: "/explore", label: "Explore", always: true },
    ...(user
      ? [
          { href: "/bury", label: "+ Bury Project", always: false, accent: true },
          { href: "/dashboard", label: "Dashboard", always: false },
          { href: `/${user.username}`, label: `@${user.username}`, always: false },
          { href: "/settings", label: "Settings", always: false },
        ]
      : [
          { href: "/login", label: "Start Burying", always: false, accent: true },
        ]),
  ];

  return (
    <>
      <nav className="border-b border-border px-6 py-4 relative z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TombstoneIcon className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold">
              my<span className="text-text-dim font-light">dead</span>projects
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs transition-colors",
                  link.accent
                    ? "px-3 py-1.5 bg-cta text-bg rounded font-medium hover:bg-cta-hover transition-colors"
                    : "text-text-muted hover:text-text-dim"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block h-px w-5 bg-text transition-all duration-200",
                open && "translate-y-[3.5px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-px w-5 bg-text transition-all duration-200",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-px w-5 bg-text transition-all duration-200",
                open && "-translate-y-[3.5px] -rotate-45"
              )}
            />
          </button>
        </div>

        {/* Mobile panel */}
        <div
          className={cn(
            "md:hidden absolute left-0 right-0 top-full bg-bg border-b border-border overflow-hidden transition-all duration-200 z-50",
            open ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-b-0"
          )}
        >
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors py-1",
                  link.accent
                    ? "text-cta font-medium"
                    : "text-text-muted hover:text-text-dim"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-bg/80 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
