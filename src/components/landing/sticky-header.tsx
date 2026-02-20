"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function StickyHeader() {
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Threshold: show after scrolling past the static header (~200px)
    const SHOW_THRESHOLD = 200;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        setVisible(y > SHOW_THRESHOLD);
        lastScrollY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Check initial position (e.g. after refresh mid-page)
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop layer */}
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-xl" />

      {/* Bottom border — thin line with subtle glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <span
            className="text-base leading-none transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            🪦
          </span>
          <span className="text-sm font-semibold tracking-tight">
            my<span className="text-text-dim font-light">dead</span>projects
          </span>
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink href="/explore">Explore</NavLink>
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="https://t.me/mydeadprojects" external>
            Community
          </NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-1.5 bg-cta text-bg text-xs font-medium rounded tracking-wide hover:bg-cta-hover transition-colors active:scale-[0.97]"
          >
            Start Burying
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "px-3 py-1.5 text-xs text-text-muted hover:text-text font-mono tracking-wide transition-colors rounded hover:bg-bg-subtle/50";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
