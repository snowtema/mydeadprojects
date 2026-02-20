"use client";

import { useEffect } from "react";

export function FirebaseAnalytics() {
  useEffect(() => {
    import("@/lib/firebase").then((m) => m.analytics);
  }, []);
  return null;
}
