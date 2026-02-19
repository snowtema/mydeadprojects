"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { usernameSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { deleteR2Object, keyFromUrl } from "@/lib/r2";

export async function claimUsername(
  username: string
): Promise<{ error?: string }> {
  const validation = usernameSchema.safeParse(username);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if user already has a profile
  const existing = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (existing) {
    return { error: "You already have a username" };
  }

  // Check availability
  const taken = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (taken) {
    return { error: "Username already taken" };
  }

  // Create user profile
  await db.insert(users).values({
    id: user.id,
    username,
    displayName:
      user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    githubUsername: user.user_metadata?.user_name || null,
  });

  return {};
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  return profile || null;
}

export async function updateProfile(input: {
  displayName: string;
  bio: string;
  showGithubLink?: boolean;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const displayName = input.displayName.trim();
  const bio = input.bio.trim();

  if (displayName.length > 100) {
    return { error: "Display name must be 100 characters or less" };
  }
  if (bio.length > 280) {
    return { error: "Bio must be 280 characters or less" };
  }

  await db
    .update(users)
    .set({
      displayName: displayName || null,
      bio: bio || null,
      showGithubLink: input.showGithubLink ?? false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/settings");

  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Clean up R2 screenshots from all user projects
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, user.id),
    columns: { screenshots: true },
  });

  const allScreenshots = userProjects.flatMap((p) => p.screenshots ?? []);
  if (allScreenshots.length > 0) {
    await Promise.allSettled(
      allScreenshots.map((url) => deleteR2Object(keyFromUrl(url)))
    );
  }

  // Delete user row (cascades to projects, which cascade to flowers + condolences)
  await db.delete(users).where(eq(users.id, user.id));

  // Sign out
  await supabase.auth.signOut();

  return {};
}
