import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc, lt, or, and, eq, sql } from "drizzle-orm";
import { ExploreGrid } from "@/components/explore-grid";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type SortOption = "recent" | "flowers";

interface Props {
  searchParams: Promise<{ sort?: string; cursor?: string }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const sort: SortOption =
    params.sort === "flowers" ? "flowers" : "recent";
  const cursor = params.cursor;

  // Build where clause based on cursor
  const cursorFilter = (() => {
    if (!cursor) return undefined;

    if (sort === "recent") {
      return lt(projects.createdAt, new Date(cursor));
    }

    // Composite cursor: "flowersCount,id"
    const [rawFlowers, id] = cursor.split(",");
    const flowers = parseInt(rawFlowers, 10);
    if (isNaN(flowers) || !id) return undefined;

    return or(
      lt(projects.flowersCount, flowers),
      and(eq(projects.flowersCount, flowers), lt(projects.id, id))
    );
  })();

  const orderBy =
    sort === "flowers"
      ? [desc(projects.flowersCount), desc(projects.id)]
      : [desc(projects.createdAt)];

  const rows = await db.query.projects.findMany({
    with: {
      user: { columns: { username: true, avatarUrl: true } },
    },
    where: cursorFilter,
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
    { key: "flowers", label: "Most Flowers" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium">Explore</h1>
        <p className="text-xs text-text-muted mt-1">
          Recently buried projects from the community.
        </p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 border-b border-border">
        {sortTabs.map((tab) => (
          <a
            key={tab.key}
            href={tab.key === "recent" ? "/explore" : `/explore?sort=${tab.key}`}
            className={cn(
              "text-xs pb-3 border-b-2 transition-colors -mb-px",
              sort === tab.key
                ? "border-accent text-text-dim"
                : "border-transparent text-text-muted hover:text-text-dim"
            )}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {items.length > 0 ? (
        <ExploreGrid projects={items} />
      ) : (
        <p className="text-center text-text-muted text-xs py-12">
          No projects buried yet. Be the first!
        </p>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-4">
          <a
            href={`/explore?sort=${sort}&cursor=${encodeURIComponent(nextCursor)}`}
            className="text-xs px-6 py-2.5 bg-bg-card border border-border rounded-md text-text-dim hover:border-border-hover transition-colors"
          >
            Load More
          </a>
        </div>
      )}
    </div>
  );
}
