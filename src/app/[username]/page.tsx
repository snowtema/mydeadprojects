import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShareMenu } from "@/components/share-menu";
import { GraveyardViewToggle } from "@/components/graveyard-view-toggle";
import { Github } from "lucide-react";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.displayName || `@${profile.username}`,
      url: graveyardUrl,
      ...(profile.avatarUrl && { image: profile.avatarUrl }),
      ...(profile.bio && { description: profile.bio }),
    },
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <h1 className="text-base font-medium">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-sm text-text-muted font-light mt-1">
              {profile.bio}
            </p>
          )}
          {profile.showGithubLink && profile.githubUsername && (
            <a
              href={`https://github.com/${profile.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-text-muted hover:text-text-dim transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              {profile.githubUsername}
            </a>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-4 text-sm text-text-muted py-3 border-y border-border">
        <span>{profile.projectsCount} buried</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">{profile.flowersReceived} <kbd className="inline-flex items-center justify-center w-4 h-4 glass-kbd border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">F</kbd></span>
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
          text={`@${profile.username} has buried ${profile.projectsCount} dead projects. Come pay your respects at their developer graveyard.`}
        />
      </div>

      {/* Graveyard */}
      <div>
        {userProjects.length > 0 ? (
          <GraveyardViewToggle projects={userProjects} username={username} />
        ) : (
          <p className="text-center text-text-muted text-sm py-12">
            No projects buried yet.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-border pt-8 text-center space-y-3">
        <p className="text-text-muted text-sm">
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
