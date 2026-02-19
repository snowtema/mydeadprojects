import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatDateRange } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
  const { projectId } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, project.userId),
  });

  const dateRange = formatDateRange(project.startDate, project.endDate);
  const username = user?.username || "unknown";

  // Status-aware OG variants
  const status = project.status;
  const isSeeking = status === "dead" && project.openForResurrection;

  const accentColor = status === "resurrected"
    ? "#5a9a5a"
    : status === "adopted"
      ? "#9B7E7E"
      : isSeeking
        ? "#C4A07C"
        : "#C4A07C";

  const headerLabel = status === "resurrected"
    ? "RESURRECTION CERTIFICATE"
    : status === "adopted"
      ? "ADOPTION CERTIFICATE"
      : isSeeking
        ? "SEEKING NECROMANCER"
        : "DEATH CERTIFICATE";

  const statusIcon = status === "resurrected"
    ? "\u2726"  // ✦
    : status === "adopted"
      ? "\u2697"  // ⚗
      : isSeeking
        ? "\u263D"  // ☽
        : "\u2020"; // †

  // Necromancer info
  let necromancerName: string | null = null;
  if (project.necromancerId) {
    const necromancer = await db.query.users.findFirst({
      where: eq(users.id, project.necromancerId),
      columns: { username: true },
    });
    necromancerName = necromancer?.username || null;
  }

  const footerLeft = status === "resurrected" && necromancerName
    ? `Resurrected by @${necromancerName}`
    : status === "adopted" && necromancerName
      ? `Adopted by @${necromancerName}`
      : isSeeking
        ? `Will you be its Necromancer?`
        : `Buried by @${username}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            width: "8px",
            height: "100%",
            background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}88 100%)`,
            flexShrink: 0,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "48px 72px",
          }}
        >
          {/* Top: label */}
          <div
            style={{
              fontSize: "28px",
              color: accentColor,
              letterSpacing: "0.3em",
            }}
          >
            {headerLabel}
          </div>

          {/* Middle: icon + name + meta + epitaph */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Icon + project name row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "108px",
                  color: accentColor,
                  lineHeight: 1,
                }}
              >
                {statusIcon}
              </div>
              <div
                style={{
                  fontSize: "80px",
                  fontWeight: 700,
                  color: "#e8e8e8",
                  lineHeight: 1.1,
                }}
              >
                {project.name}
              </div>
            </div>

            {/* Date + cause */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                paddingLeft: "136px",
                fontSize: "32px",
                color: "#808080",
              }}
            >
              <div style={{ display: "flex" }}>{dateRange}</div>
              <div style={{ display: "flex", color: "#444" }}>{"\u00B7"}</div>
              <div style={{ display: "flex" }}>{project.causeOfDeath}</div>
            </div>

            {/* Epitaph */}
            <div
              style={{
                fontSize: "40px",
                fontStyle: "italic",
                color: "#b0b0b0",
                lineHeight: 1.4,
                paddingLeft: "136px",
                marginTop: "12px",
              }}
            >
              {`\u201C${project.epitaph}\u201D`}
            </div>

            {/* Resurrection proof link */}
            {status === "resurrected" && project.resurrectionProofUrl && (
              <div
                style={{
                  fontSize: "28px",
                  color: "#5a9a5a",
                  paddingLeft: "136px",
                  marginTop: "8px",
                  display: "flex",
                }}
              >
                IT LIVES!
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${accentColor}33`,
              paddingTop: "20px",
            }}
          >
            <div style={{ fontSize: "28px", color: "#808080" }}>
              {footerLeft}
            </div>
            <div style={{ fontSize: "28px", color: "#555" }}>
              mydeadprojects.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
  } catch (e) {
    console.error("OG image error:", e);
    return new Response(
      `OG error: ${e instanceof Error ? e.message : String(e)}`,
      { status: 500 }
    );
  }
}
