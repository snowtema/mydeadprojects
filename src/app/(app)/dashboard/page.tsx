import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { GraveyardGrid } from "@/components/graveyard-grid";
import { EmptyGraveyard } from "@/components/empty-graveyard";
import { ShareMenu } from "@/components/share-menu";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login"); // layout handles auth-without-profile

  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, user.id),
    orderBy: [desc(projects.createdAt)],
  });

  const graveyardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${user.username}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Your Graveyard</h1>
          <div className="text-xs text-text-muted mt-1 flex items-center gap-3">
            <span>{user.projectsCount} projects buried</span>
            <span>·</span>
            <span>{user.flowersReceived} respects</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShareMenu url={graveyardUrl} title={`@${user.username}'s graveyard`} text={`I've buried ${user.projectsCount} dead projects. Come pay your respects at my developer graveyard.`} />
          <Link
            href="/bury"
            className="text-xs px-4 py-2 bg-cta text-bg rounded-md font-medium hover:bg-cta-hover transition-colors"
          >
            + Bury Project
          </Link>
        </div>
      </div>

      <div className="h-px bg-border" />

      {userProjects.length > 0 ? (
        <GraveyardGrid
          projects={userProjects}
          username={user.username}
          showEdit
        />
      ) : (
        <EmptyGraveyard />
      )}
    </div>
  );
}
