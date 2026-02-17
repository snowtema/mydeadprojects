import { BuryForm } from "@/components/bury-form";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Bury a Project",
};

export default async function BuryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-lg font-medium mb-1">Bury a Project</h1>
      <div className="h-px bg-border mb-8" />
      <BuryForm username={user.username} />
    </div>
  );
}
