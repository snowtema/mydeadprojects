"use client";

import { useState } from "react";
import { ItLivesCelebration } from "@/components/it-lives-celebration";

interface DebugCelebrationProps {
  projectName: string;
  projectUrl: string;
  pageUrl: string;
}

export function DebugCelebration({ projectName, projectUrl, pageUrl }: DebugCelebrationProps) {
  const [show, setShow] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-[0.6rem] px-2 py-1 bg-red-dim border border-red/30 rounded text-red/70 hover:text-red transition-colors cursor-pointer"
      >
        [debug] IT LIVES!
      </button>
      {show && (
        <ItLivesCelebration
          projectName={projectName}
          projectUrl={projectUrl}
          pageUrl={pageUrl}
        />
      )}
    </>
  );
}
