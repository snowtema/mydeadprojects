"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-lg font-medium mb-1">Settings</h1>
        <div className="h-px bg-border" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xs text-text-dim uppercase tracking-wider">
          Account
        </h2>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-xs bg-bg-card border border-border rounded-md text-red hover:border-red transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
