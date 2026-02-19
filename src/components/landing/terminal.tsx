"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const CHAR_DELAY = 50;
const CHAR_JITTER = 30;
const LINE_DELAY = 150;
const POST_TYPE_PAUSE = 400;
const PRE_CMD_PAUSE = 500;

type Phase =
  | { action: "type"; group: number }
  | { action: "hint" }
  | { action: "reveal"; group: number }
  | { action: "pause"; ms: number }
  | { action: "done" };

const sequence: Phase[] = [
  { action: "type", group: 1 },
  { action: "hint" },
  { action: "reveal", group: 2 },
  { action: "pause", ms: PRE_CMD_PAUSE },
  { action: "type", group: 3 },
  { action: "hint" },
  { action: "reveal", group: 4 },
  { action: "done" },
];

interface TerminalLine {
  group: number;
  type: "cmd" | "output" | "comment" | "success";
  text: string;
  cmdText?: string;
}

const lines: TerminalLine[] = [
  { group: 1, type: "cmd", text: "", cmdText: "ls ~/projects/abandoned/" },
  {
    group: 2,
    type: "output",
    text: "todo-app-v3/  crypto-tracker/  ai-chatbot/",
  },
  {
    group: 2,
    type: "output",
    text: "saas-idea/    dating-for-dogs/  yet-another-cms/",
  },
  { group: 3, type: "cmd", text: "", cmdText: "deadprojects bury --all" },
  { group: 4, type: "comment", text: "# cataloging 6 projects..." },
  { group: 4, type: "success", text: "\u2713 6 projects laid to rest." },
  {
    group: 4,
    type: "comment",
    text: "# visit mydeadprojects.com/~artem to pay respects",
  },
];

export function Terminal() {
  const reducedMotion = useReducedMotion();
  const [visibleGroups, setVisibleGroups] = useState<Set<number>>(new Set());
  const [typedTexts, setTypedTexts] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [showFinalCursor, setShowFinalCursor] = useState(false);
  const [typingGroup, setTypingGroup] = useState<number | null>(null);
  const phaseRef = useRef(0);
  const waitingRef = useRef(false);
  const startedRef = useRef(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const typeText = useCallback(
    (group: number, text: string): Promise<void> => {
      return new Promise((resolve) => {
        setTypingGroup(group);
        let i = 0;
        function next() {
          if (i < text.length) {
            setTypedTexts((prev) => ({
              ...prev,
              [group]: text.slice(0, i + 1),
            }));
            i++;
            const delay =
              CHAR_DELAY + Math.random() * CHAR_JITTER * 2 - CHAR_JITTER;
            setTimeout(next, delay);
          } else {
            setTimeout(() => {
              setTypingGroup(null);
              resolve();
            }, POST_TYPE_PAUSE);
          }
        }
        next();
      });
    },
    []
  );

  const revealGroup = useCallback((group: number): Promise<void> => {
    return new Promise((resolve) => {
      const groupLines = lines.filter((l) => l.group === group);
      groupLines.forEach((_, i) => {
        setTimeout(() => {
          setVisibleGroups((prev) => new Set(prev).add(group));
          if (i === groupLines.length - 1) {
            setTimeout(resolve, 100);
          }
        }, i * LINE_DELAY);
      });
      if (groupLines.length === 0) resolve();
    });
  }, []);

  const runNext = useCallback(async () => {
    if (phaseRef.current >= sequence.length) return;
    const step = sequence[phaseRef.current++];

    if (step.action === "type") {
      setVisibleGroups((prev) => new Set(prev).add(step.group));
      const cmdLine = lines.find(
        (l) => l.group === step.group && l.type === "cmd"
      );
      if (cmdLine?.cmdText) {
        await typeText(step.group, cmdLine.cmdText);
      }
      runNext();
    } else if (step.action === "hint") {
      setShowHint(true);
      waitingRef.current = true;
    } else if (step.action === "reveal") {
      await revealGroup(step.group);
      runNext();
    } else if (step.action === "pause") {
      setTimeout(runNext, step.ms);
    } else if (step.action === "done") {
      setShowFinalCursor(true);
    }
  }, [typeText, revealGroup]);

  const handleInteract = useCallback(() => {
    if (!waitingRef.current) return;
    setShowHint(false);
    waitingRef.current = false;
    runNext();
  }, [runNext]);

  useEffect(() => {
    if (reducedMotion && !startedRef.current) {
      startedRef.current = true;
      const allGroups = new Set(lines.map((l) => l.group));
      setVisibleGroups(allGroups);
      const textMap: Record<number, string> = {};
      lines.forEach((l) => {
        if (l.cmdText) textMap[l.group] = l.cmdText;
      });
      setTypedTexts(textMap);
      setShowFinalCursor(true);
      return;
    }

    const terminal = terminalRef.current;
    if (!terminal || startedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            setTimeout(runNext, 500);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(terminal);
    return () => observer.disconnect();
  }, [runNext, reducedMotion]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && waitingRef.current) {
        e.preventDefault();
        handleInteract();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleInteract]);

  return (
    <div
      ref={terminalRef}
      onClick={handleInteract}
      className="bg-bg-card border border-border rounded-lg overflow-hidden text-left max-w-[520px] mx-auto cursor-pointer focus:outline-none"
      tabIndex={0}
      aria-label="Interactive terminal demo"
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-bg-subtle border-b border-border">
        <div className="w-2.5 h-2.5 rounded-full bg-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow" />
        <div className="w-2.5 h-2.5 rounded-full bg-green" />
      </div>

      {/* Body */}
      <div className="p-5 text-[0.8rem] leading-[1.8]">
        {(() => {
          const lastVisibleIdx = lines.reduce((acc, line, i) =>
            visibleGroups.has(line.group) ? i : acc, -1);

          return lines.map((line, i) => {
            const isVisible = visibleGroups.has(line.group);
            const hintAfter = showHint && i === lastVisibleIdx;

            let lineEl: React.ReactNode;

            if (line.type === "cmd") {
              const typed = isVisible ? (typedTexts[line.group] ?? "") : "";
              const isTyping = typingGroup === line.group;
              lineEl = (
                <div
                  className={isVisible ? "animate-[fade-in_0.3s_ease_forwards]" : "opacity-0"}
                >
                  <span className="text-text-dim select-none">~ $ </span>
                  <span className="text-text">{isVisible ? typed : line.cmdText}</span>
                  {isTyping && (
                    <span className="text-text animate-[cursor-blink_1s_step-end_infinite]">
                      {"\u2588"}
                    </span>
                  )}
                </div>
              );
            } else {
              const colorClass =
                line.type === "success"
                  ? "text-green"
                  : line.type === "comment"
                    ? "text-text-muted italic"
                    : "text-text-muted";

              lineEl = (
                <div
                  className={`${colorClass} ${isVisible ? "animate-[fade-in_0.3s_ease_forwards]" : "opacity-0"}`}
                >
                  {line.text}
                </div>
              );
            }

            if (hintAfter) {
              return (
                <Fragment key={i}>
                  {lineEl}
                  <div className="h-0">
                    <div
                      className="flex items-center gap-2.5 pt-3 pb-0.5 animate-[fade-in_0.4s_ease_forwards] cursor-pointer"
                      onClick={handleInteract}
                    >
                      <span className="inline-flex items-center px-3 py-1 glass-kbd border border-border-hover border-b-2 rounded text-text-dim text-[0.7rem] tracking-wide animate-[cursor-blink_2s_ease-in-out_infinite] hover:border-text-muted transition-colors">
                        &crarr; Enter
                      </span>
                      <span className="text-text-muted text-[0.65rem] tracking-wide">
                        to run
                      </span>
                    </div>
                  </div>
                </Fragment>
              );
            }

            return <Fragment key={i}>{lineEl}</Fragment>;
          });
        })()}

        {/* Final cursor — always rendered to reserve space */}
        <div className={showFinalCursor ? "animate-[fade-in_0.3s_ease_forwards]" : "opacity-0"}>
          <span className="text-text-dim select-none">~ $ </span>
          {showFinalCursor && (
            <span className="text-text animate-[cursor-blink_1s_step-end_infinite]">
              {"\u2588"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
