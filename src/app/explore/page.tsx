import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc, and, eq, sql, count } from "drizzle-orm";
import { ExploreViewToggle } from "@/components/explore-view-toggle";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type SortOption = "recent" | "flowers" | "wished";
type TabOption = "all" | "seeking";

interface Props {
  searchParams: Promise<{
    sort?: string;
    page?: string;
    cause?: string;
    tab?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const tab: TabOption = params.tab === "seeking" ? "seeking" : "all";
  const sort: SortOption =
    params.sort === "flowers"
      ? "flowers"
      : params.sort === "wished"
        ? "wished"
        : "recent";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const causeFilter = params.cause || null;

  // Get all unique causes of death for the filter UI
  const causesResult = await db
    .select({ cause: projects.causeOfDeath })
    .from(projects)
    .groupBy(projects.causeOfDeath)
    .orderBy(sql`count(*) desc`);
  const causes = causesResult.map((r) => r.cause);

  // Build where clause
  const conditions = [];
  if (causeFilter) {
    conditions.push(eq(projects.causeOfDeath, causeFilter));
  }
  if (tab === "seeking") {
    conditions.push(eq(projects.openForResurrection, true));
    conditions.push(eq(projects.status, "dead"));
  }
  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count for pagination
  const [{ total }] = await db
    .select({ total: count() })
    .from(projects)
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;

  const orderBy =
    sort === "flowers"
      ? [desc(projects.flowersCount), desc(projects.id)]
      : sort === "wished"
        ? [desc(projects.resurrectionWishesCount), desc(projects.id)]
        : [desc(projects.createdAt)];

  const rows = await db.query.projects.findMany({
    with: {
      user: { columns: { username: true, avatarUrl: true } },
    },
    where: whereClause,
    orderBy,
    limit: PAGE_SIZE,
    offset,
  });

  const sortTabs: { key: SortOption; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "flowers", label: "Most Respected" },
    ...(tab === "seeking"
      ? [{ key: "wished" as SortOption, label: "Most Wished" }]
      : []),
  ];

  // Build URL helpers that preserve active filters
  function buildUrl(overrides: {
    sort?: string;
    page?: number;
    cause?: string | null;
    tab?: string;
  }) {
    const p = new URLSearchParams();
    const t = overrides.tab ?? tab;
    if (t !== "all") p.set("tab", t);
    const s = overrides.sort ?? sort;
    if (s !== "recent") p.set("sort", s);
    const c = overrides.cause !== undefined ? overrides.cause : causeFilter;
    if (c) p.set("cause", c);
    const pg = overrides.page ?? safePage;
    if (pg > 1) p.set("page", String(pg));
    const qs = p.toString();
    return `/explore${qs ? `?${qs}` : ""}`;
  }

  function buildPageUrl(page: number) {
    return buildUrl({ page });
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
          className={cn(
            "text-sm pb-3 border-b-2 transition-colors -mb-px",
            tab === "all"
              ? "border-accent text-text-dim"
              : "border-transparent text-text-muted hover:text-text-dim"
          )}
        >
          Projects
        </a>
        <a
          href={buildUrl({ tab: "seeking", sort: "recent", page: 1, cause: null })}
          className={cn(
            "text-sm pb-3 border-b-2 transition-colors -mb-px",
            tab === "seeking"
              ? "border-green text-green"
              : "border-transparent text-text-muted hover:text-text-dim"
          )}
        >
          Seeking Revival
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
            href={buildUrl({ sort: tab.key, page: 1 })}
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
            href={buildUrl({ cause: null, page: 1 })}
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
                page: 1,
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

      {rows.length > 0 ? (
        <ExploreViewToggle projects={rows} />
      ) : (
        <p className="text-center text-text-muted text-sm py-12">
          {causeFilter
            ? `No projects with cause "${causeFilter}" found.`
            : "No projects buried yet. Be the first!"}
        </p>
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        buildUrl={buildPageUrl}
      />
    </div>
  );
}
