"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const REDIRECT_SECONDS = 8;

interface FuneralAnimationProps {
  projectName: string;
  username: string;
  slug: string;
}

export function FuneralAnimation({
  projectName,
  username,
  slug,
}: FuneralAnimationProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (reducedMotion) {
      setShowText(true);
      setShowButtons(true);
    } else {
      const textTimer = setTimeout(() => setShowText(true), 1200);
      const buttonTimer = setTimeout(() => setShowButtons(true), 2400);
      return () => {
        clearTimeout(textTimer);
        clearTimeout(buttonTimer);
      };
    }
  }, [reducedMotion]);

  // Countdown + redirect
  useEffect(() => {
    if (!showButtons) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/graveyard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showButtons, router]);

  const twitterText = `RIP ${projectName}. Press F to pay respects.`;
  const projectUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}/${slug}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(projectUrl)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center px-6">
      {/* Particles */}
      {!reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-accent/30"
              style={{
                left: `${15 + i * 10}%`,
                bottom: "30%",
                animation: `float-up ${2 + (i % 3) * 0.5}s ease-in ${0.5 + i * 0.3}s both`,
              }}
            />
          ))}
        </div>
      )}

      {/* Tombstone emoji */}
      <div
        className="mb-8 text-7xl"
        style={
          reducedMotion
            ? undefined
            : { animation: "descend 1s ease both" }
        }
      >
        🪦
      </div>

      {/* Text */}
      {showText && (
        <div className="text-center space-y-3 mb-10">
          <p className="text-xl font-serif italic text-text-dim">
            Rest in peace, {projectName}
          </p>
          <p className="text-xs text-text-muted font-light">
            Your project has been laid to rest.
          </p>
        </div>
      )}

      {/* Buttons */}
      {showButtons && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors"
            >
              Share Funeral
            </a>
            <button
              onClick={() => router.push("/graveyard")}
              className="px-6 py-3 bg-bg-card border border-border rounded-md text-sm text-text-dim hover:border-border-hover transition-colors cursor-pointer"
            >
              Visit Graveyard
            </button>
          </div>
          {countdown > 0 && (
            <p className="text-xs text-text-muted font-light">
              Opening graveyard in {countdown}s...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
