"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteR2Object, keyFromUrl } from "@/lib/r2";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function deleteScreenshot(
  projectId: string,
  url: string
): Promise<{ error?: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });
  if (!project) return { error: "Project not found" };

  try {
    const key = keyFromUrl(url);
    await deleteR2Object(key);
  } catch {
    // R2 delete failure is non-fatal — the URL will still be removed from DB
  }

  const updated = (project.screenshots ?? []).filter((s) => s !== url);
  await db
    .update(projects)
    .set({ screenshots: updated, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath("/graveyard");
  return {};
}
