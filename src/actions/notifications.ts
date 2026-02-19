"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false))
    );
  return result[0]?.count ?? 0;
}

export async function getNotifications(userId: string) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
    with: {
      project: {
        columns: { name: true, slug: true },
        with: { user: { columns: { username: true } } },
      },
    },
  });
}

export async function markNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false))
    );
}

const WISH_MILESTONES = [5, 10, 25, 50, 100];

export async function checkWishMilestone(
  projectId: string,
  projectName: string,
  ownerId: string,
  newCount: number
) {
  const milestone = WISH_MILESTONES.find((m) => m === newCount);
  if (!milestone) return;

  await db.insert(notifications).values({
    userId: ownerId,
    type: "wish_milestone",
    message: `${projectName} reached ${milestone} resurrection wishes!`,
    projectId,
  });
}
