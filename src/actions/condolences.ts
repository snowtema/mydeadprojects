"use server";

import { db } from "@/lib/db";
import { condolences, projects } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

function hashIP(ip: string): string {
  // Simple hash for anonymization — not crypto-grade, just for dedup
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function addCondolence(
  projectId: string,
  message: string
): Promise<{ error?: string }> {
  const { success } = await rateLimit("condolence", 10, 60);
  if (!success) {
    return { error: "Too many requests. Please try again later." };
  }

  if (!message || message.trim().length === 0) {
    return { error: "Message is required" };
  }
  if (message.length > 280) {
    return { error: "Message must be 280 characters or less" };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const visitorHash = hashIP(ip);

  // Look up the project to get slug + username for revalidation
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { slug: true },
    with: { user: { columns: { username: true } } },
  });

  await db.insert(condolences).values({
    projectId,
    visitorHash,
    message: message.trim(),
  });

  revalidatePath("/");
  if (project?.user?.username) {
    revalidatePath(`/${project.user.username}/${project.slug}`);
  }

  return {};
}

export async function deleteCondolence(
  condolenceId: string,
  projectId: string
): Promise<{ error?: string }> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the user owns the project this condolence belongs to
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    columns: { id: true, slug: true },
    with: { user: { columns: { username: true } } },
  });

  if (!project) return { error: "Not authorized" };

  await db.delete(condolences).where(eq(condolences.id, condolenceId));

  if (project.user?.username) {
    revalidatePath(`/${project.user.username}/${project.slug}`);
  }

  return {};
}

export async function getCondolences(projectId: string) {
  return db.query.condolences.findMany({
    where: eq(condolences.projectId, projectId),
    orderBy: [desc(condolences.createdAt)],
    limit: 50,
  });
}
