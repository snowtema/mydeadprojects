import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { usernameSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
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
