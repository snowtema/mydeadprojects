"use server";

import { db } from "@/lib/db";
import { flowers, projects, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { createHash } from "crypto";

function hashVisitor(ip: string): string {
  return createHash("sha256").update(ip + "mdp-salt").digest("hex");
}

export async function addFlower(
  projectId: string
): Promise<{ error?: string }> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const visitorHash = hashVisitor(ip);

  try {
    await db.insert(flowers).values({
      projectId,
      visitorHash,
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

    return {};
  } catch {
    // Unique constraint violation = already left a flower
    return { error: "You already left a flower on this project" };
  }
}
