import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { formatDateRange } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate required env vars
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!appUrl || !botToken || !channelId) {
    console.error("[telegram-cron] Missing required environment variables");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  // 2. Pick a random unposted project
  let candidates = await db.query.projects.findMany({
    where: isNull(projects.telegramPostedAt),
    with: { user: { columns: { username: true } } },
  });

  // If all projects have been posted, reset and start a new cycle
  if (candidates.length === 0) {
    const total = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects);

    if (total[0].count === 0) {
      return NextResponse.json({ skipped: "no projects exist" });
    }

    await db.update(projects).set({ telegramPostedAt: null });

    candidates = await db.query.projects.findMany({
      with: { user: { columns: { username: true } } },
    });
  }

  const project =
    candidates[Math.floor(Math.random() * candidates.length)];

  if (!project.user) {
    console.error(
      `[telegram-cron] Project ${project.id} has no associated user, skipping`
    );
    return NextResponse.json(
      { skipped: "orphaned project", projectId: project.id }
    );
  }

  const username = project.user.username;
  const projectUrl = `${appUrl}/${username}/${project.slug}`;
  const ogImageUrl =
    project.ogImageUrl || `${appUrl}/api/og/${project.id}`;

  // 3. Build caption (Telegram HTML, max 1024 chars for sendPhoto)
  const dateRange = formatDateRange(project.startDate, project.endDate);
  const techLine =
    project.techStack && project.techStack.length > 0
      ? `\n🛠 ${project.techStack.slice(0, 5).map(escapeHtml).join(", ")}`
      : "";

  let caption = [
    `#random`,
    ``,
    `<b>✝ ${escapeHtml(project.name)}</b>`,
    `<i>"${escapeHtml(project.epitaph)}"</i>`,
    ``,
    `📅 ${dateRange}`,
    `💀 Причина смерти: ${escapeHtml(project.causeOfDeath)}`,
    techLine ? techLine.trimStart() : null,
    ``,
    `<a href="${escapeHtml(projectUrl)}">Смотреть полный некролог →</a>`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  if (caption.length > 1024) {
    caption = caption.slice(0, 1021) + "...";
  }

  // 4. Fetch OG image and send to Telegram as multipart upload
  const imageResponse = await fetch(ogImageUrl);
  if (!imageResponse.ok) {
    console.error(
      `[telegram-cron] Failed to fetch OG image: ${imageResponse.status}`
    );
    return NextResponse.json(
      { error: "Failed to fetch OG image" },
      { status: 502 }
    );
  }
  const imageBlob = await imageResponse.blob();

  const form = new FormData();
  form.append("chat_id", channelId);
  form.append("photo", imageBlob, "og.png");
  form.append("caption", caption);
  form.append("parse_mode", "HTML");

  const telegramResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/sendPhoto`,
    { method: "POST", body: form }
  );

  if (!telegramResponse.ok) {
    const err = await telegramResponse.text();
    console.error(`[telegram-cron] Telegram API error: ${err}`);
    return NextResponse.json(
      { error: "Telegram API error", detail: err },
      { status: 502 }
    );
  }

  // 5. Mark as posted (optimistic: only if still unposted)
  await db
    .update(projects)
    .set({ telegramPostedAt: new Date() })
    .where(and(eq(projects.id, project.id), isNull(projects.telegramPostedAt)));

  console.log(
    `[telegram-cron] Posted project "${project.name}" (${project.id})`
  );
  return NextResponse.json({
    ok: true,
    projectId: project.id,
    projectName: project.name,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
