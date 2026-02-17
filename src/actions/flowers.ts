"use server";

import { db } from "@/lib/db";
import { flowers, projects, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { createHash } from "crypto";

const VALID_TYPES = ["flower", "candle", "rip", "lol"] as const;

function hashVisitor(ip: string): string {
  return createHash("sha256").update(ip + "mdp-salt").digest("hex");
}

async function getVisitorHash(): Promise<string> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  return hashVisitor(ip);
}

export async function getVisitorReaction(
  projectId: string
): Promise<string | null> {
  const visitorHash = await getVisitorHash();

  const existing = await db.query.flowers.findFirst({
    where: and(
      eq(flowers.projectId, projectId),
      eq(flowers.visitorHash, visitorHash)
    ),
    columns: { flowerType: true },
  });

  return existing?.flowerType ?? null;
}

export async function addFlower(
  projectId: string,
  flowerType: string = "flower"
): Promise<{ error?: string; isNew?: boolean }> {
  if (!VALID_TYPES.includes(flowerType as (typeof VALID_TYPES)[number])) {
    return { error: "Invalid reaction type" };
  }

  const visitorHash = await getVisitorHash();

  // Check if visitor already reacted
  const existing = await db.query.flowers.findFirst({
    where: and(
      eq(flowers.projectId, projectId),
      eq(flowers.visitorHash, visitorHash)
    ),
    columns: { id: true, flowerType: true },
  });

  if (existing) {
    if (existing.flowerType === flowerType) {
      return { error: "same_type", isNew: false };
    }
    // Change reaction type (total count stays the same)
    await db
      .update(flowers)
      .set({ flowerType })
      .where(eq(flowers.id, existing.id));
    return { isNew: false };
  }

  // New reaction
  try {
    await db.insert(flowers).values({
      projectId,
      visitorHash,
      flowerType,
    });

    // Increment flowers count on project
    await db
      .update(projects)
      .set({ flowersCount: sql`${projects.flowersCount} + 1` })
      .where(eq(projects.id, projectId));

    // Increment flowers received on user
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: { userId: true },
    });

    if (project) {
      await db
        .update(users)
        .set({ flowersReceived: sql`${users.flowersReceived} + 1` })
        .where(eq(users.id, project.userId));
    }

    return { isNew: true };
  } catch {
    return { error: "Failed to add reaction" };
  }
}
