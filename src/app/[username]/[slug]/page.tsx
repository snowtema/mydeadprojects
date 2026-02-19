import { db } from "@/lib/db";
import { users, projects, flowers, adoptionPledges } from "@/lib/db/schema";
import { eq, and, ne, lt, gt, sql, asc, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateRange, timeSinceDeath } from "@/lib/utils";
import { FlowerButton, type ReactionCounts } from "@/components/flower-button";
import { ShareMenu } from "@/components/share-menu";
import { TombstoneCard } from "@/components/tombstone-card";
import { CondolenceBook } from "@/components/condolence-book";
import { getCondolences } from "@/actions/condolences";
import { getCurrentUser } from "@/actions/auth";
import { getPendingPledges } from "@/actions/resurrection";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { ResurrectionBadge } from "@/components/resurrection-badge";
import { ResurrectionToggle } from "@/components/resurrection-toggle";
import { PledgeReview } from "@/components/pledge-review";
import { AdoptButton } from "@/components/adopt-button";
import { ResurrectionProof } from "@/components/resurrection-proof";
import { WishButton } from "@/components/wish-button";
import { ResurrectionCertificate } from "@/components/resurrection-certificate";
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

  const isSeeking = project.openForResurrection && project.status === "dead";
  const statusLabel = project.status === "resurrected"
    ? "Resurrected"
    : project.status === "adopted"
      ? "Adopted"
      : isSeeking
        ? "Seeking Necromancer"
        : "RIP";

  const ogDescription = project.status === "resurrected"
    ? `"${project.epitaph}" — ${project.name} has risen from the dead!`
    : isSeeking
      ? `"${project.epitaph}" — This project is seeking a Necromancer. Will you bring it back to life?`
      : `"${project.epitaph}" — Cause of death: ${project.causeOfDeath}. Buried by @${username}.`;

  return {
    title: `${project.name} — ${statusLabel}`,
    description: project.epitaph,
    alternates: {
      canonical: `/${username}/${slug}`,
    },
    openGraph: {
      title: `${project.name} (${project.startDate}\u2013${project.endDate}) — ${statusLabel}`,
      description: ogDescription,
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

  // Check if the current user is the project owner
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === profile.id;

  // Resurrection data
  const isSeeking =
    project.openForResurrection && project.status === "dead";
  const isNecromancer =
    currentUser?.id === project.necromancerId;
  const pendingPledges =
    isOwner ? await getPendingPledges(project.id) : [];

  // Check if current visitor has a pending pledge
  let visitorHasPendingPledge = false;
  if (currentUser && !isOwner && isSeeking) {
    const existingPledge = await db.query.adoptionPledges.findFirst({
      where: and(
        eq(adoptionPledges.projectId, project.id),
        eq(adoptionPledges.userId, currentUser.id),
        eq(adoptionPledges.status, "pending")
      ),
      columns: { id: true },
    });
    visitorHasPendingPledge = !!existingPledge;
  }

  // Necromancer info for adopted/resurrected
  let necromancerUsername: string | null = null;
  let approvedPledgeMessage: string | null = null;
  if (project.necromancerId && (project.status === "adopted" || project.status === "resurrected")) {
    const [necromancer, approvedPledge] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, project.necromancerId),
        columns: { username: true },
      }),
      db.query.adoptionPledges.findFirst({
        where: and(
          eq(adoptionPledges.projectId, project.id),
          eq(adoptionPledges.status, "approved")
        ),
        columns: { message: true },
      }),
    ]);
    necromancerUsername = necromancer?.username || null;
    approvedPledgeMessage = approvedPledge?.message || null;
  }

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${project.name} — RIP`,
    description: project.epitaph,
    datePublished: project.createdAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: profile.displayName || `@${profile.username}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${username}`,
    },
    url: projectUrl,
    image: project.ogImageUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/og/${project.id}`,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: project.flowersCount,
    },
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back link + Edit */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${username}`}
          className="text-sm text-text-muted hover:text-text-dim transition-colors"
        >
          &larr; @{username}&apos;s graveyard
        </Link>
        {isOwner && (
          <Link
            href={`/bury/${project.id}/edit`}
            className="text-xs px-3 py-1.5 bg-bg-card border border-border rounded-md text-text-muted hover:text-text-dim hover:border-border-hover transition-colors"
          >
            Edit
          </Link>
        )}
      </div>

      {/* Tombstone with prev/next navigation */}
      <div className="relative max-w-2xl mx-auto flex items-center justify-center">
        {/* Prev project */}
        {prevProject ? (
          <Link
            href={`/${username}/${prevProject.slug}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-text-muted hover:text-text-dim transition-colors hidden sm:block max-w-[120px] text-left leading-tight"
            title={prevProject.name}
          >
            <span className="block text-text-muted/50 text-xs mb-0.5">&larr; prev</span>
            <span className="line-clamp-2">{prevProject.name}</span>
          </Link>
        ) : null}

        {/* Tombstone */}
        <div className="max-w-sm w-full">
          <div className={`tombstone-card p-8 border border-border rounded-t-md text-center space-y-3${
            project.status === "resurrected" ? " tombstone-resurrected" :
            project.status === "adopted" ? " tombstone-adopted" :
            isSeeking ? " tombstone-seeking" : ""
          }`}>
            <div className={`text-2xl ${
              project.status === "resurrected" ? "text-green" :
              project.status === "adopted" ? "text-accent" :
              isSeeking ? "text-cta resurrection-pulse" :
              "tombstone-cross text-text-muted"
            }`}>{
              project.status === "resurrected" ? "✦" :
              project.status === "adopted" ? "⚗" :
              isSeeking ? "☽" : "✝"
            }</div>
            <h1 className="text-xl font-medium text-text-dim">{project.name}</h1>
            <div className="text-xs text-text-muted font-light">
              {formatDateRange(project.startDate, project.endDate)}
              <span className="mx-1.5">&middot;</span>
              Dead for {timeSinceDeath(project.endDate)}
            </div>
            <div className="text-lg font-serif text-text-dim italic leading-relaxed">
              &ldquo;{project.epitaph}&rdquo;
            </div>
            {approvedPledgeMessage && necromancerUsername && (
              <div className="border-t border-border/50 pt-3 mt-1 space-y-1">
                <div className="text-xs font-serif text-text-dim italic leading-relaxed">
                  &ldquo;{approvedPledgeMessage}&rdquo;
                </div>
                <div className="text-xs text-text-muted">
                  &mdash; @{necromancerUsername}
                </div>
              </div>
            )}
          </div>
          <div className="tombstone-base mx-[10%] h-2 bg-bg border border-border border-t-0 rounded-b" />
        </div>

        {/* Next project */}
        {nextProject ? (
          <Link
            href={`/${username}/${nextProject.slug}`}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-text-muted hover:text-text-dim transition-colors hidden sm:block max-w-[120px] text-right leading-tight"
            title={nextProject.name}
          >
            <span className="block text-text-muted/50 text-xs mb-0.5">next &rarr;</span>
            <span className="line-clamp-2">{nextProject.name}</span>
          </Link>
        ) : null}
      </div>

      {/* Mobile prev/next (hidden on desktop since they're beside the tombstone) */}
      {(prevProject || nextProject) && (
        <div className="flex justify-between items-center text-sm text-text-muted sm:hidden">
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

      {/* Engagement block — right under the tombstone */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <div className="inline-flex items-center gap-2">
          <FlowerButton
            projectId={project.id}
            reactionCounts={reactionCounts}
          />
          {isSeeking && (
            <>
              <div className="w-px h-4 bg-border/40" />
              <WishButton
                projectId={project.id}
                initialCount={project.resurrectionWishesCount}
              />
            </>
          )}
        </div>
        <div className="hidden sm:block w-px h-6 bg-border" />
        <ShareMenu
          url={projectUrl}
          title={`${project.name} — ${project.status === "resurrected" ? "Resurrected" : "RIP"}`}
          text={
            project.status === "resurrected"
              ? `IT LIVES! ${project.name} was dead but has been resurrected. From grave to glory.`
              : isSeeking
                ? `${project.name} is looking for a second chance. Will you be its Necromancer? Press R to wish it back to life.`
                : `RIP ${project.name} (${project.startDate}\u2013${project.endDate}). Cause of death: ${project.causeOfDeath}. Press F to pay respects.`
          }
        />
      </div>

      {/* Meta row: cause of death + external links */}
      <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
        <div>
          <span className="text-text-dim">Cause of death:</span>{" "}
          {project.causeOfDeath}
        </div>
        <span className="hidden sm:inline text-border">|</span>
        <div className="text-accent">
          Dead for {timeSinceDeath(project.endDate)}
        </div>
        {project.websiteUrl && (
          <>
            <span className="hidden sm:inline text-border">|</span>
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-dim transition-colors border-b border-border hover:border-text-dim"
            >
              Website
            </a>
          </>
        )}
        {project.repoUrl && (
          <>
            <span className="hidden sm:inline text-border">|</span>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-dim transition-colors border-b border-border hover:border-text-dim"
            >
              Repository
            </a>
          </>
        )}
      </div>

      {/* Content sections */}
      <div className="max-w-2xl mx-auto space-y-6">
        {project.description && (
          <div className="border-t border-border pt-6">
            <h2 className="text-xs uppercase tracking-widest text-text-muted mb-3">Description</h2>
            <p className="font-body text-base text-text-dim leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}

        {project.lessonsLearned && (
          <div className="border-t border-border pt-6">
            <h2 className="text-xs uppercase tracking-widest text-text-muted mb-3">Lessons Learned</h2>
            <p className="font-body text-base text-text-dim leading-relaxed whitespace-pre-wrap">
              {project.lessonsLearned}
            </p>
          </div>
        )}

        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 bg-bg-card border border-border rounded text-text-muted text-xs"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.screenshots && project.screenshots.length > 0 && (
          <div className="border-t border-border pt-6">
            <h2 className="text-xs uppercase tracking-widest text-text-muted mb-3">Screenshots</h2>
            <ScreenshotGallery urls={project.screenshots} />
          </div>
        )}
      </div>

      {/* Condolence book */}
      <div className="max-w-2xl mx-auto">
        <CondolenceBook
          projectId={project.id}
          initialCondolences={initialCondolences}
          isOwner={isOwner}
        />
      </div>

      {/* Resurrection section */}
      {(project.status !== "dead" || project.openForResurrection || isOwner) && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-xs uppercase tracking-widest text-text-muted pb-3 border-b border-border">
            // resurrection
          </div>

          <div>
            <ResurrectionBadge
              status={project.status}
              openForResurrection={project.openForResurrection}
            />
          </div>

          {/* Owner: toggle resurrection */}
          {isOwner && project.status === "dead" && (
            <ResurrectionToggle
              projectId={project.id}
              projectName={project.name}
              projectUrl={projectUrl}
              initialOpen={project.openForResurrection}
            />
          )}

          {/* Owner: review pending pledges */}
          {isOwner && pendingPledges.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                {pendingPledges.length} pending pledge{pendingPledges.length > 1 ? "s" : ""}
              </p>
              {pendingPledges.map((pledge) => (
                <PledgeReview key={pledge.id} pledge={pledge} />
              ))}
            </div>
          )}

          {/* Visitor: adopt */}
          {!isOwner && isSeeking && (
            <AdoptButton
              projectId={project.id}
              projectName={project.name}
              projectUrl={projectUrl}
              isAuthenticated={!!currentUser}
              hasPendingPledge={visitorHasPendingPledge}
            />
          )}

          {/* Necromancer: submit proof */}
          {isNecromancer && project.status === "adopted" && (
            <ResurrectionProof
              projectId={project.id}
              projectName={project.name}
              projectUrl={projectUrl}
            />
          )}

          {/* Resurrected: certificate + proof link */}
          {project.status === "resurrected" && necromancerUsername && project.resurrectedAt && (
            <ResurrectionCertificate
              projectName={project.name}
              epitaph={project.epitaph}
              causeOfDeath={project.causeOfDeath}
              startDate={project.startDate}
              endDate={project.endDate}
              ownerUsername={username}
              necromancerUsername={necromancerUsername}
              resurrectedAt={project.resurrectedAt}
              proofUrl={project.resurrectionProofUrl}
            />
          )}
          {project.status === "resurrected" && project.resurrectionProofUrl && !necromancerUsername && (
            <a
              href={project.resurrectionProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green hover:underline"
            >
              View resurrected project &rarr;
            </a>
          )}
        </div>
      )}

      {/* Similar graves */}
      {similarProjects.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-text-muted pb-3 border-b border-border">
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
        <p className="text-text-muted text-sm mb-2">
          From @{username}&apos;s graveyard
        </p>
        <Link
          href={`/${username}`}
          className="text-sm text-text-dim hover:text-text transition-colors border-b border-border hover:border-text-dim"
        >
          {profile.projectsCount} projects buried &middot; View full graveyard
        </Link>
      </div>

      {/* CTA */}
      <div className="border-t border-border pt-8 text-center space-y-3">
        <p className="text-text-muted text-sm">
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
