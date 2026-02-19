"use server";

import { db } from "@/lib/db";
import {
  projects,
  resurrectionWishes,
  adoptionPledges,
  users,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { pledgeSchema } from "@/lib/validators";

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

function revalidateProject(username: string, slug: string) {
  revalidatePath(`/${username}/${slug}`);
  revalidatePath("/explore");
}

// --- Public (no auth) ---

export async function getVisitorWish(
  projectId: string
): Promise<boolean> {
  const visitorHash = await getVisitorHash();

  const existing = await db.query.resurrectionWishes.findFirst({
    where: and(
      eq(resurrectionWishes.projectId, projectId),
      eq(resurrectionWishes.visitorHash, visitorHash)
    ),
    columns: { id: true },
  });

  return !!existing;
}

export async function addResurrectionWish(
  projectId: string
): Promise<{ error?: string; alreadyWished?: boolean }> {
  const { success } = await rateLimit("wish", 20, 60);
  if (!success) {
    return { error: "Too many requests. Please try again later." };
  }

  const visitorHash = await getVisitorHash();

  // Check if already wished
  const existing = await db.query.resurrectionWishes.findFirst({
    where: and(
      eq(resurrectionWishes.projectId, projectId),
      eq(resurrectionWishes.visitorHash, visitorHash)
    ),
    columns: { id: true },
  });

  if (existing) {
    return { alreadyWished: true };
  }

  try {
    await db.insert(resurrectionWishes).values({
      projectId,
      visitorHash,
    });

    // Increment counter
    await db
      .update(projects)
      .set({
        resurrectionWishesCount: sql`${projects.resurrectionWishesCount} + 1`,
      })
      .where(eq(projects.id, projectId));

    // Revalidate
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: { slug: true },
      with: { user: { columns: { username: true } } },
    });
    if (project?.user?.username) {
      revalidateProject(project.user.username, project.slug);
    }

    return {};
  } catch {
    return { error: "Failed to add wish" };
  }
}

// --- Auth required ---

export async function toggleOpenForResurrection(
  projectId: string
): Promise<{ error?: string; open?: boolean }> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    columns: {
      id: true,
      slug: true,
      status: true,
      openForResurrection: true,
    },
    with: { user: { columns: { username: true } } },
  });

  if (!project) return { error: "Not authorized" };
  if (project.status !== "dead")
    return { error: "Only dead projects can be opened for resurrection" };

  const newValue = !project.openForResurrection;

  await db
    .update(projects)
    .set({ openForResurrection: newValue, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  if (project.user?.username) {
    revalidateProject(project.user.username, project.slug);
  }

  return { open: newValue };
}

export async function submitPledge(
  projectId: string,
  message: string
): Promise<{ error?: string }> {
  const { success } = await rateLimit("pledge", 5, 3600);
  if (!success) {
    return { error: "Too many requests. Please try again later." };
  }

  const validation = pledgeSchema.safeParse({ message });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {
      id: true,
      slug: true,
      userId: true,
      status: true,
      openForResurrection: true,
    },
    with: { user: { columns: { username: true } } },
  });

  if (!project) return { error: "Project not found" };
  if (project.userId === user.id)
    return { error: "You cannot adopt your own project" };
  if (project.status !== "dead")
    return { error: "Project is not dead" };
  if (!project.openForResurrection)
    return { error: "Project is not open for resurrection" };

  try {
    await db.insert(adoptionPledges).values({
      projectId,
      userId: user.id,
      message: message.trim(),
    });

    if (project.user?.username) {
      revalidateProject(project.user.username, project.slug);
    }

    return {};
  } catch {
    return {
      error: "A pending pledge already exists for this project",
    };
  }
}

export async function resolvePledge(
  pledgeId: string,
  action: "approve" | "decline"
): Promise<{ error?: string }> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const pledge = await db.query.adoptionPledges.findFirst({
    where: and(
      eq(adoptionPledges.id, pledgeId),
      eq(adoptionPledges.status, "pending")
    ),
    with: {
      project: {
        columns: { id: true, slug: true, userId: true },
        with: { user: { columns: { username: true } } },
      },
    },
  });

  if (!pledge) return { error: "Pledge not found" };
  if (pledge.project.userId !== user.id) return { error: "Not authorized" };

  if (action === "approve") {
    // Update pledge status
    await db
      .update(adoptionPledges)
      .set({ status: "approved", resolvedAt: new Date() })
      .where(eq(adoptionPledges.id, pledgeId));

    // Update project: mark as adopted, set necromancer
    await db
      .update(projects)
      .set({
        status: "adopted",
        necromancerId: pledge.userId,
        openForResurrection: false,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, pledge.project.id));
  } else {
    await db
      .update(adoptionPledges)
      .set({ status: "declined", resolvedAt: new Date() })
      .where(eq(adoptionPledges.id, pledgeId));
  }

  if (pledge.project.user?.username) {
    revalidateProject(pledge.project.user.username, pledge.project.slug);
  }

  return {};
}

export async function submitResurrectionProof(
  projectId: string,
  url: string
): Promise<{ error?: string }> {
  if (!url || !url.startsWith("http")) {
    return { error: "Please provide a valid URL" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.necromancerId, user.id),
      eq(projects.status, "adopted")
    ),
    columns: { id: true, slug: true },
    with: { user: { columns: { username: true } } },
  });

  if (!project) return { error: "Not authorized" };

  await db
    .update(projects)
    .set({
      status: "resurrected",
      resurrectionProofUrl: url,
      resurrectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  if (project.user?.username) {
    revalidateProject(project.user.username, project.slug);
  }

  return {};
}

// --- Query helpers ---

export async function getPendingPledge(projectId: string) {
  return db.query.adoptionPledges.findFirst({
    where: and(
      eq(adoptionPledges.projectId, projectId),
      eq(adoptionPledges.status, "pending")
    ),
    with: {
      user: {
        columns: { username: true, displayName: true, avatarUrl: true },
      },
    },
  });
}
