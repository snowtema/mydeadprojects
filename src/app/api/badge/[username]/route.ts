import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  const count = user?.projectsCount ?? 0;

  const labelWidth = 120;
  const countWidth = 40;
  const totalWidth = labelWidth + countWidth;
  const height = 20;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <rect width="${totalWidth}" height="${height}" rx="3" fill="#0a0a0a"/>
  <rect x="${labelWidth}" width="${countWidth}" height="${height}" rx="3" fill="#141414"/>
  <rect x="${labelWidth}" width="4" height="${height}" fill="#141414"/>
  <text x="6" y="14" fill="#999999" font-family="monospace" font-size="11">🪦 dead projects</text>
  <text x="${labelWidth + countWidth / 2}" y="14" fill="#e0e0e0" font-family="monospace" font-size="11" text-anchor="middle">${count}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
