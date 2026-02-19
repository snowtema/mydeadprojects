import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc, lt, or, and, eq, sql } from "drizzle-orm";
import { ExploreGrid } from "@/components/explore-grid";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type SortOption = "recent" | "flowers";

interface Props {
  searchParams: Promise<{
    sort?: string;
    cursor?: string;
    cause?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const sort: SortOption =
    params.sort === "flowers" ? "flowers" : "recent";
  const cursor = params.cursor;
  const causeFilter = params.cause || null;

  // Get all unique causes of death for the filter UI
  const causesResult = await db
    .select({ cause: projects.causeOfDeath })
    .from(projects)
    .groupBy(projects.causeOfDeath)
    .orderBy(sql`count(*) desc`);
  const causes = causesResult.map((r) => r.cause);

  // Build where clauses
  const conditions: ReturnType<typeof eq>[] = [];

  if (causeFilter) {
    conditions.push(eq(projects.causeOfDeath, causeFilter));
  }

  // Cursor filter
  if (cursor) {
    if (sort === "recent") {
      conditions.push(lt(projects.createdAt, new Date(cursor)));
    } else {
      const [rawFlowers, id] = cursor.split(",");
      const flowersNum = parseInt(rawFlowers, 10);
      if (!isNaN(flowersNum) && id) {
        conditions.push(
          or(
            lt(projects.flowersCount, flowersNum),
            and(
              eq(projects.flowersCount, flowersNum),
              lt(projects.id, id)
            )
          )!
        );
      }
    }
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === "flowers"
      ? [desc(projects.flowersCount), desc(projects.id)]
      : [desc(projects.createdAt)];

  const rows = await db.query.projects.findMany({
    with: {
      user: { columns: { username: true, avatarUrl: true } },
    },
    where: whereClause,
    orderBy,
    limit: PAGE_SIZE + 1,
  });

  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  const nextCursor = (() => {
    if (!hasMore || items.length === 0) return null;
    const last = items[items.length - 1];
    if (sort === "flowers") {
      return `${last.flowersCount},${last.id}`;
    }
    return last.createdAt.toISOString();
  })();

  const sortTabs: { key: SortOption; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "flowers", label: "Most Respected" },
  ];

  // Build URL helpers that preserve active filters
  function buildUrl(overrides: {
    sort?: string;
    cursor?: string;
    cause?: string | null;
  }) {
    const p = new URLSearchParams();
    const s = overrides.sort ?? sort;
    if (s !== "recent") p.set("sort", s);
    const c = overrides.cause !== undefined ? overrides.cause : causeFilter;
    if (c) p.set("cause", c);
    if (overrides.cursor) p.set("cursor", overrides.cursor);
    const qs = p.toString();
    return `/explore${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium">Explore</h1>
        <p className="text-sm text-text-muted mt-1">
          Recently buried projects from the community.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-6 border-b border-border">
        <a
          href="/explore"
          className="text-sm pb-3 border-b-2 border-accent text-text-dim transition-colors -mb-px"
        >
          Projects
        </a>
        <a
          href="/explore/people"
          className="text-sm pb-3 border-b-2 border-transparent text-text-muted hover:text-text-dim transition-colors -mb-px"
        >
          People
        </a>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 border-b border-border">
        {sortTabs.map((tab) => (
          <a
            key={tab.key}
            href={buildUrl({ sort: tab.key, cursor: undefined })}
            className={cn(
              "text-sm pb-3 border-b-2 transition-colors -mb-px",
              sort === tab.key
                ? "border-accent text-text-dim"
                : "border-transparent text-text-muted hover:text-text-dim"
            )}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Cause of death filter */}
      {causes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <a
            href={buildUrl({ cause: null, cursor: undefined })}
            className={cn(
              "text-xs px-2.5 py-1 rounded border transition-colors",
              !causeFilter
                ? "bg-accent/10 border-accent text-accent"
                : "bg-bg-card border-border text-text-muted hover:border-border-hover hover:text-text-dim"
            )}
          >
            All
          </a>
          {causes.map((cause) => (
            <a
              key={cause}
              href={buildUrl({
                cause: causeFilter === cause ? null : cause,
                cursor: undefined,
              })}
              className={cn(
                "text-xs px-2.5 py-1 rounded border transition-colors",
                causeFilter === cause
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-bg-card border-border text-text-muted hover:border-border-hover hover:text-text-dim"
              )}
            >
              {cause}
            </a>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <ExploreGrid projects={items} />
      ) : (
        <p className="text-center text-text-muted text-sm py-12">
          {causeFilter
            ? `No projects with cause "${causeFilter}" found.`
            : "No projects buried yet. Be the first!"}
        </p>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-4">
          <a
            href={buildUrl({ cursor: nextCursor })}
            className="text-sm px-6 py-2.5 bg-bg-card border border-border rounded-md text-text-dim hover:border-border-hover transition-colors"
          >
            Load More
          </a>
        </div>
      )}
    </div>
  );
}
