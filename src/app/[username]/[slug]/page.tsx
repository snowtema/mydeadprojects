import { db } from "@/lib/db";
import { users, projects, flowers } from "@/lib/db/schema";
import { eq, and, ne, lt, gt, sql, asc, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateRange, timeSinceDeath } from "@/lib/utils";
import { FlowerButton, type ReactionCounts } from "@/components/flower-button";
import { ShareMenu } from "@/components/share-menu";
import { TombstoneCard } from "@/components/tombstone-card";
import { CondolenceBook } from "@/components/condolence-book";
import { getCondolences } from "@/actions/condolences";
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

  const ogImage = project.ogImageUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/og/${project.id}`;

  return {
    title: `${project.name} — RIP`,
    description: project.epitaph,
    openGraph: {
      title: `${project.name} (${project.startDate}\u2013${project.endDate}) — RIP`,
      description: `"${project.epitaph}" — Cause of death: ${project.causeOfDeath}. Buried by @${username}.`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
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

  // Query per-type reaction counts
  const reactionRows = await db
    .select({
      flowerType: flowers.flowerType,
      count: sql<number>`count(*)::int`,
    })
    .from(flowers)
    .where(eq(flowers.projectId, project.id))
    .groupBy(flowers.flowerType);

  const reactionCounts: ReactionCounts = {
    flower: 0,
    candle: 0,
    rip: 0,
    lol: 0,
  };
  for (const row of reactionRows) {
    const key = row.flowerType as keyof ReactionCounts;
    if (key in reactionCounts) {
      reactionCounts[key] = row.count;
    }
  }

  // Condolences
  const initialCondolences = await getCondolences(project.id);

  // Similar graves: same cause of death, excluding current
  const similarProjects = await db.query.projects.findMany({
    where: and(
      eq(projects.causeOfDeath, project.causeOfDeath),
      ne(projects.id, project.id)
    ),
    orderBy: sql`RANDOM()`,
    limit: 3,
    with: { user: true },
  });

  // Prev/next projects by this author
  const [prevProject, nextProject] = await Promise.all([
    db.query.projects.findFirst({
      where: and(
        eq(projects.userId, profile.id),
        ne(projects.id, project.id),
        lt(projects.createdAt, project.createdAt)
      ),
      orderBy: [desc(projects.createdAt)],
      columns: { name: true, slug: true },
    }),
    db.query.projects.findFirst({
      where: and(
        eq(projects.userId, profile.id),
        ne(projects.id, project.id),
        gt(projects.createdAt, project.createdAt)
      ),
      orderBy: [asc(projects.createdAt)],
      columns: { name: true, slug: true },
    }),
  ]);

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
            <span className="mx-1">&middot;</span>
            Dead for {timeSinceDeath(project.endDate)}
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

        {project.description && (
          <div className="border-t border-border pt-4">
            <h2 className="text-text-dim mb-2">Description</h2>
            <p className="text-text-muted font-light leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}

        {project.lessonsLearned && (
          <div className="border-t border-border pt-4">
            <h2 className="text-text-dim mb-2">Lessons Learned</h2>
            <p className="text-text-muted font-light leading-relaxed whitespace-pre-wrap">
              {project.lessonsLearned}
            </p>
          </div>
        )}

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

        <div className="flex items-center justify-center gap-4 pt-4">
          <FlowerButton
            projectId={project.id}
            reactionCounts={reactionCounts}
          />
          <ShareMenu
            url={projectUrl}
            title={`${project.name} — RIP`}
            text={`RIP ${project.name} (${project.startDate}\u2013${project.endDate}). Cause of death: ${project.causeOfDeath}. Press F to pay respects.`}
          />
        </div>

        <CondolenceBook
          projectId={project.id}
          initialCondolences={initialCondolences}
        />

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

      {/* Similar graves */}
      {similarProjects.length > 0 && (
        <div className="space-y-4">
          <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted pb-3 border-b border-border">
            // similar graves
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {similarProjects.map((p) => (
              <TombstoneCard
                key={p.id}
                project={p}
                username={p.user.username}
              />
            ))}
          </div>
        </div>
      )}

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

      {/* Prev/next navigation */}
      {(prevProject || nextProject) && (
        <div className="flex justify-between items-center text-xs text-text-muted border-t border-border pt-4">
          {prevProject ? (
            <Link
              href={`/${username}/${prevProject.slug}`}
              className="hover:text-text-dim transition-colors"
            >
              &larr; {prevProject.name}
            </Link>
          ) : (
            <span />
          )}
          {nextProject ? (
            <Link
              href={`/${username}/${nextProject.slug}`}
              className="hover:text-text-dim transition-colors"
            >
              {nextProject.name} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* CTA */}
      <div className="border-t border-border pt-8 text-center space-y-3">
        <p className="text-text-muted text-xs">
          Have dead projects of your own?
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-bg-card border border-border rounded-md text-sm text-text-dim hover:border-border-hover transition-colors"
        >
          Start Burying
        </Link>
      </div>
    </div>
  );
}
