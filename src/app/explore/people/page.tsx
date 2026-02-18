import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, lt, or, and, eq } from "drizzle-orm";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "People — Explore",
  description: "Discover developers who buried their dead projects.",
};

const PAGE_SIZE = 20;

type SortOption = "recent" | "respected" | "buried";

interface Props {
  searchParams: Promise<{ sort?: string; cursor?: string }>;
}

export default async function ExplorePeoplePage({ searchParams }: Props) {
  const params = await searchParams;

  const sort: SortOption =
    params.sort === "respected"
      ? "respected"
      : params.sort === "buried"
        ? "buried"
        : "recent";

  const cursor = params.cursor;

  const cursorFilter = (() => {
    if (!cursor) return undefined;

    if (sort === "recent") {
      return lt(users.createdAt, new Date(cursor));
    }

    const [rawCount, id] = cursor.split(",");
    const count = parseInt(rawCount, 10);
    if (isNaN(count) || !id) return undefined;

    const col =
      sort === "respected" ? users.flowersReceived : users.projectsCount;
    return or(lt(col, count), and(eq(col, count), lt(users.id, id)));
  })();

  const orderBy =
    sort === "respected"
      ? [desc(users.flowersReceived), desc(users.id)]
      : sort === "buried"
        ? [desc(users.projectsCount), desc(users.id)]
        : [desc(users.createdAt)];

  const rows = await db.query.users.findMany({
    columns: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      projectsCount: true,
      flowersReceived: true,
      createdAt: true,
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
    if (sort === "respected") return `${last.flowersReceived},${last.id}`;
    if (sort === "buried") return `${last.projectsCount},${last.id}`;
    return last.createdAt.toISOString();
  })();

  const sortTabs: { key: SortOption; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "respected", label: "Most Respected" },
    { key: "buried", label: "Most Buried" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium">Explore</h1>
        <p className="text-sm text-text-muted mt-1">
          Developers who buried their dead projects.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-6 border-b border-border">
        <a
          href="/explore"
          className="text-sm pb-3 border-b-2 border-transparent text-text-muted hover:text-text-dim transition-colors -mb-px"
        >
          Projects
        </a>
        <a
          href="/explore/people"
          className="text-sm pb-3 border-b-2 border-accent text-text-dim transition-colors -mb-px"
        >
          People
        </a>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 border-b border-border">
        {sortTabs.map((tab) => (
          <a
            key={tab.key}
            href={
              tab.key === "recent"
                ? "/explore/people"
                : `/explore/people?sort=${tab.key}`
            }
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

      {items.length > 0 ? (
        <div className="divide-y divide-border">
          {items.map((person) => (
            <a
              key={person.id}
              href={`/${person.username}`}
              className="flex items-start gap-3 py-4 group hover:bg-bg-card -mx-2 px-2 rounded-md transition-colors"
            >
              {person.avatarUrl ? (
                <Image
                  src={person.avatarUrl}
                  alt={person.username}
                  width={36}
                  height={36}
                  className="rounded-full border border-border shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center text-sm shrink-0">
                  🪦
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-dim group-hover:text-text transition-colors">
                  @{person.username}
                  {person.displayName && (
                    <span className="ml-2 text-xs text-text-muted font-normal">
                      {person.displayName}
                    </span>
                  )}
                </div>
                {person.bio && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {person.bio}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                  <span>{person.projectsCount} buried</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    {person.flowersReceived}{" "}
                    <kbd className="inline-flex items-center justify-center w-4 h-4 bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">
                      F
                    </kbd>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-text-muted text-sm py-12">
          No people found.
        </p>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-4">
          <a
            href={`/explore/people?sort=${sort}&cursor=${encodeURIComponent(nextCursor)}`}
            className="text-sm px-6 py-2.5 bg-bg-card border border-border rounded-md text-text-dim hover:border-border-hover transition-colors"
          >
            Load More
          </a>
        </div>
      )}
    </div>
  );
}
