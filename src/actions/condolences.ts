"use server";

import { db } from "@/lib/db";
import { condolences } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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

  await db.insert(condolences).values({
    projectId,
    visitorHash,
    message: message.trim(),
  });

  revalidatePath("/");

  return {};
}

export async function getCondolences(projectId: string) {
  return db.query.condolences.findMany({
    where: eq(condolences.projectId, projectId),
    orderBy: [desc(condolences.createdAt)],
    limit: 50,
  });
}
