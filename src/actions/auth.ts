"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { usernameSchema } from "@/lib/validators";

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
