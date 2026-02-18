import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { usernameSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { success } = await rateLimit("username-check", 30, 60);
  if (!success) {
    return NextResponse.json(
      { available: false, reason: "Too many requests" },
      { status: 429 }
    );
  }

  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { available: false, reason: "Username is required" },
      { status: 400 }
    );
  }

  const validation = usernameSchema.safeParse(username);
  if (!validation.success) {
    return NextResponse.json({
      available: false,
      reason: validation.error.errors[0].message,
    });
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  return NextResponse.json({ available: !existing });
}
