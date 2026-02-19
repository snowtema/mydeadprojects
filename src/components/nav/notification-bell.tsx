"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getUnreadNotificationCount,
} from "@/actions/notifications";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadNotificationCount(userId).then(setCount);
  }, [userId]);

  return (
    <Link
      href="/notifications"
      className="relative text-text-muted hover:text-text-dim transition-colors"
      title="Notifications"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 13a2 2 0 0 0 4 0" />
        <path d="M13 7a5 5 0 0 0-10 0c0 4-2 5-2 5h14s-2-1-2-5" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center bg-green text-bg text-[0.55rem] font-bold rounded-full px-0.5">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
