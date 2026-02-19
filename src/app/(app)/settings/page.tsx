import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-lg font-medium mb-1">Settings</h1>
        <div className="h-px bg-border" />
      </div>

      <SettingsForm
        initialDisplayName={user.displayName ?? ""}
        initialBio={user.bio ?? ""}
        username={user.username}
      />
    </div>
  );
}
