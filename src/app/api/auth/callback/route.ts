import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_REDIRECT_PATHS = ["/graveyard", "/bury", "/settings", "/explore", "/reset-password"];

function getSafeRedirectPath(next: string | null): string {
  if (!next) return "/graveyard";
  // Only allow relative paths starting with /
  if (!next.startsWith("/") || next.startsWith("//")) return "/graveyard";
  // Only allow known paths
  const matchedPath = ALLOWED_REDIRECT_PATHS.find((path) =>
    next.startsWith(path)
  );
  return matchedPath ? next : "/graveyard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user has a profile (username set)
        const existing = await db.query.users.findFirst({
          where: eq(users.id, user.id),
        });

        if (!existing) {
          // New user — redirect to username selection
          return NextResponse.redirect(
            `${origin}/signup/username`
          );
        }

        // Update githubUsername if user linked GitHub after initial signup
        const ghUsername = user.user_metadata?.user_name;
        if (existing && ghUsername && !existing.githubUsername) {
          await db
            .update(users)
            .set({ githubUsername: ghUsername, updatedAt: new Date() })
            .where(eq(users.id, user.id));
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
