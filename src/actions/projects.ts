"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { projectSchema, type ProjectInput } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { deleteR2Object, keyFromUrl } from "@/lib/r2";

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createProject(
  input: ProjectInput
): Promise<{ error?: string; slug?: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const validation = projectSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const data = validation.data;
  const slug = slugify(data.name);

  if (!slug) return { error: "Invalid project name" };

  // Check for duplicate slug
  const existing = await db.query.projects.findFirst({
    where: and(eq(projects.userId, userId), eq(projects.slug, slug)),
  });

  if (existing) {
    return { error: "You already have a project with this name" };
  }

  await db.insert(projects).values({
    userId,
    slug,
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    causeOfDeath: data.causeOfDeath,
    epitaph: data.epitaph,
    description: data.description || null,
    lessonsLearned: data.lessonsLearned || null,
    websiteUrl: data.websiteUrl || null,
    repoUrl: data.repoUrl || null,
    techStack: data.techStack || null,
    screenshots: data.screenshots || null,
  });

  // Increment user's project count
  await db
    .update(users)
    .set({ projectsCount: sql`${users.projectsCount} + 1` })
    .where(eq(users.id, userId));

  revalidatePath("/graveyard");

  return { slug };
}

export async function updateProject(
  projectId: string,
  input: ProjectInput
): Promise<{ error?: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const validation = projectSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const existing = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });

  if (!existing) return { error: "Project not found" };

  const data = validation.data;
  const slug = slugify(data.name);

  // Clean up removed screenshots from R2
  const prevScreenshots = existing.screenshots ?? [];
  const nextScreenshots = data.screenshots ?? [];
  const removedScreenshots = prevScreenshots.filter(
    (u) => !nextScreenshots.includes(u)
  );
  if (removedScreenshots.length > 0) {
    await Promise.allSettled(
      removedScreenshots.map((u) => deleteR2Object(keyFromUrl(u)))
    );
  }

  await db
    .update(projects)
    .set({
      slug,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      causeOfDeath: data.causeOfDeath,
      epitaph: data.epitaph,
      description: data.description || null,
      lessonsLearned: data.lessonsLearned || null,
      websiteUrl: data.websiteUrl || null,
      repoUrl: data.repoUrl || null,
      techStack: data.techStack || null,
      screenshots: data.screenshots || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  revalidatePath("/graveyard");

  return {};
}

export async function updateProjectPosition(
  projectId: string,
  positionX: number,
  positionY: number
): Promise<{ error?: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const existing = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });

  if (!existing) return { error: "Project not found" };

  // Clamp to 0..1
  const x = Math.max(0, Math.min(1, positionX));
  const y = Math.max(0, Math.min(1, positionY));

  await db
    .update(projects)
    .set({ positionX: x, positionY: y, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath("/graveyard");

  return {};
}

export async function deleteProject(
  projectId: string
): Promise<{ error?: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const existing = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });

  if (!existing) return { error: "Project not found" };

  // Clean up R2 screenshots
  if (existing.screenshots?.length) {
    await Promise.allSettled(
      existing.screenshots.map((url) => deleteR2Object(keyFromUrl(url)))
    );
  }

  await db.delete(projects).where(eq(projects.id, projectId));

  // Decrement user's project count
  await db
    .update(users)
    .set({ projectsCount: sql`GREATEST(${users.projectsCount} - 1, 0)` })
    .where(eq(users.id, userId));

  revalidatePath("/graveyard");

  return {};
}
