"use server";

import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { desc, and, eq, sql, count, lt, or } from "drizzle-orm";
import type { Project, User } from "@/lib/db/schema";

const PAGE_SIZE = 12;
const PEOPLE_PAGE_SIZE = 20;

export type ProjectWithUser = Project & {
  user: Pick<User, "username" | "avatarUrl">;
};

export type PersonItem = Pick<
  User,
  | "id"
  | "username"
  | "displayName"
  | "avatarUrl"
  | "bio"
  | "projectsCount"
  | "flowersReceived"
  | "createdAt"
>;

export type ExploreProjectsResult = {
  rows: ProjectWithUser[];
  causes: string[];
  total: number;
  totalPages: number;
};

export type ExplorePeopleResult = {
  items: PersonItem[];
  nextCursor: string | null;
};

export async function getExploreProjects(params: {
  tab: "all" | "seeking";
  sort: "recent" | "flowers" | "wished";
  cause: string | null;
  page: number;
}): Promise<ExploreProjectsResult> {
  const { tab, sort, cause, page } = params;

  const causesResult = await db
    .select({ cause: projects.causeOfDeath })
    .from(projects)
    .groupBy(projects.causeOfDeath)
    .orderBy(sql`count(*) desc`);
  const causes = causesResult.map((r) => r.cause);

  const conditions = [];
  if (cause) {
    conditions.push(eq(projects.causeOfDeath, cause));
  }
  if (tab === "seeking") {
    conditions.push(eq(projects.openForResurrection, true));
    conditions.push(eq(projects.status, "dead"));
  }
  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(projects)
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
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

  return { rows, causes, total, totalPages };
}

export async function getExplorePeople(params: {
  sort: "recent" | "respected" | "buried";
  cursor: string | null;
}): Promise<ExplorePeopleResult> {
  const { sort, cursor } = params;

  const cursorFilter = (() => {
    if (!cursor) return undefined;

    if (sort === "recent") {
      return lt(users.createdAt, new Date(cursor));
    }

    const [rawCount, id] = cursor.split(",");
    const cnt = parseInt(rawCount, 10);
    if (isNaN(cnt) || !id) return undefined;

    const col =
      sort === "respected" ? users.flowersReceived : users.projectsCount;
    return or(lt(col, cnt), and(eq(col, cnt), lt(users.id, id)));
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
    limit: PEOPLE_PAGE_SIZE + 1,
  });

  const hasMore = rows.length > PEOPLE_PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PEOPLE_PAGE_SIZE) : rows;

  const nextCursor = (() => {
    if (!hasMore || items.length === 0) return null;
    const last = items[items.length - 1];
    if (sort === "respected") return `${last.flowersReceived},${last.id}`;
    if (sort === "buried") return `${last.projectsCount},${last.id}`;
    return last.createdAt.toISOString();
  })();

  return { items, nextCursor };
}
