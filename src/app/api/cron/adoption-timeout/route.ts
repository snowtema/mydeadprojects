import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, adoptionPledges, notifications } from "@/lib/db/schema";
import { and, eq, lt, isNotNull, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TIMEOUT_DAYS = 30;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TIMEOUT_DAYS);

  // Find adopted projects past the timeout
  const expired = await db.query.projects.findMany({
    where: and(
      eq(projects.status, "adopted"),
      isNotNull(projects.adoptedAt),
      lt(projects.adoptedAt, cutoff)
    ),
    columns: {
      id: true,
      name: true,
      userId: true,
      necromancerId: true,
    },
  });

  if (expired.length === 0) {
    return NextResponse.json({ ok: true, reverted: 0 });
  }

  let reverted = 0;

  for (const project of expired) {
    // Revert to dead + seeking
    await db
      .update(projects)
      .set({
        status: "dead",
        openForResurrection: true,
        necromancerId: null,
        adoptedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project.id));

    // Decline all pending pledges for this project
    await db
      .update(adoptionPledges)
      .set({ status: "expired", resolvedAt: new Date() })
      .where(
        and(
          eq(adoptionPledges.projectId, project.id),
          eq(adoptionPledges.status, "approved")
        )
      );

    // Notify owner
    await db.insert(notifications).values({
      userId: project.userId,
      type: "adoption_timeout",
      message: `${project.name} adoption timed out after ${TIMEOUT_DAYS} days. It's back to seeking a necromancer.`,
      projectId: project.id,
    });

    reverted++;
    console.log(
      `[adoption-timeout] Reverted "${project.name}" (${project.id})`
    );
  }

  return NextResponse.json({ ok: true, reverted });
}
