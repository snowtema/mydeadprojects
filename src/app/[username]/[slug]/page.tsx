import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateRange } from "@/lib/utils";
import { FlowerButton } from "@/components/flower-button";
import { ShareMenu } from "@/components/share-menu";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;

  const profile = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (!profile) return {};

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.userId, profile.id), eq(projects.slug, slug)),
  });
  if (!project) return {};

  return {
    title: `${project.name} — RIP`,
    description: project.epitaph,
    openGraph: {
      title: `${project.name} (${project.startDate}\u2013${project.endDate}) — RIP`,
      description: `"${project.epitaph}" — Cause of death: ${project.causeOfDeath}. Buried by @${username}.`,
      ...(project.ogImageUrl && {
        images: [{ url: project.ogImageUrl, width: 1200, height: 630 }],
      }),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { username, slug } = await params;

  const profile = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (!profile) notFound();

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.userId, profile.id), eq(projects.slug, slug)),
  });
  if (!project) notFound();

  const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${username}/${slug}`;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href={`/${username}`}
        className="text-xs text-text-muted hover:text-text-dim transition-colors"
      >
        &larr; @{username}&apos;s graveyard
      </Link>

      {/* Large Tombstone */}
      <div className="max-w-xs mx-auto">
        <div className="tombstone-card p-8 border border-border rounded-t-md text-center space-y-3">
          <div className="tombstone-cross text-2xl text-text-muted">&#10013;</div>
          <h1 className="text-lg font-medium text-text-dim">{project.name}</h1>
          <div className="text-xs text-text-muted font-light">
            {formatDateRange(project.startDate, project.endDate)}
          </div>
          <div className="text-lg font-serif text-text-dim italic leading-relaxed">
            &ldquo;{project.epitaph}&rdquo;
          </div>
        </div>
        <div className="tombstone-base mx-[10%] h-2 bg-bg border border-border border-t-0 rounded-b" />
      </div>

      {/* Details */}
      <div className="max-w-lg mx-auto space-y-4 text-xs">
        <div className="flex gap-8 justify-center text-text-muted">
          <div>
            <span className="text-text-dim">Cause of death:</span>{" "}
            {project.causeOfDeath}
          </div>
        </div>

        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-bg-card border border-border rounded text-text-muted text-[0.6rem]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.description && (
          <div className="border-t border-border pt-4">
            <h2 className="text-text-dim mb-2">Description</h2>
            <p className="text-text-muted font-light leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-4">
          <FlowerButton
            projectId={project.id}
            initialCount={project.flowersCount}
          />
          <ShareMenu
            url={projectUrl}
            title={`${project.name} — RIP`}
            text={`RIP ${project.name} (${project.startDate}\u2013${project.endDate}). Cause of death: ${project.causeOfDeath}. Press F to pay respects.`}
          />
        </div>

        {(project.websiteUrl || project.repoUrl) && (
          <div className="flex items-center justify-center gap-4 text-text-muted">
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-dim transition-colors border-b border-border hover:border-text-dim"
              >
                Website
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-dim transition-colors border-b border-border hover:border-text-dim"
              >
                Repository
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer link to graveyard */}
      <div className="border-t border-border pt-6 text-center">
        <p className="text-text-muted text-xs mb-2">
          From @{username}&apos;s graveyard
        </p>
        <Link
          href={`/${username}`}
          className="text-xs text-text-dim hover:text-text transition-colors border-b border-border hover:border-text-dim"
        >
          {profile.projectsCount} projects buried &middot; View full graveyard
        </Link>
      </div>
    </div>
  );
}
