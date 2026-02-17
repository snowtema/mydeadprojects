import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GraveyardGrid } from "@/components/graveyard-grid";
import { ShareMenu } from "@/components/share-menu";

export default async function GraveyardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const profile = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!profile) notFound();

  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, profile.id),
    orderBy: [desc(projects.createdAt)],
  });

  const graveyardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${username}`;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center space-y-3">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.username}
            width={64}
            height={64}
            className="rounded-full mx-auto border border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-bg-card border border-border flex items-center justify-center text-2xl mx-auto">
            🪦
          </div>
        )}
        <div>
          <h1 className="text-sm font-medium">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-xs text-text-muted font-light mt-1">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-4 text-xs text-text-muted py-3 border-y border-border">
        <span>{profile.projectsCount} buried</span>
        <span>·</span>
        <span>{profile.flowersReceived} 🌸</span>
        <span>·</span>
        <span>
          member since {profile.createdAt.getFullYear()}
        </span>
      </div>

      {/* Share */}
      <div className="flex justify-center">
        <ShareMenu
          url={graveyardUrl}
          title={`@${profile.username}'s graveyard`}
          text={`Check out @${profile.username}'s graveyard of dead projects on My Dead Projects`}
        />
      </div>

      {/* Graveyard Grid */}
      <div>
        <div className="text-[0.65rem] text-text-muted uppercase tracking-widest border-b border-border pb-3 mb-6">
          The Graveyard
        </div>

        {userProjects.length > 0 ? (
          <GraveyardGrid projects={userProjects} username={username} />
        ) : (
          <p className="text-center text-text-muted text-xs py-12">
            No projects buried yet.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-border pt-8 text-center space-y-3">
        <p className="text-text-muted text-xs">
          Don&apos;t just spectate.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-bg-card border border-border rounded-md text-sm text-text-dim hover:border-border-hover transition-colors"
        >
          Bury your own dead projects
        </Link>
      </div>
    </div>
  );
}
