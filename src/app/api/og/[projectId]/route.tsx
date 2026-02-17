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
            width: "6px",
            height: "100%",
            background: "linear-gradient(180deg, #C4A07C 0%, #8a6a4a 100%)",
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
            padding: "52px 64px",
          }}
        >
          {/* Top: label */}
          <div
            style={{
              fontSize: "18px",
              color: "#C4A07C",
              letterSpacing: "0.3em",
            }}
          >
            DEATH CERTIFICATE
          </div>

          {/* Middle: cross + name + meta + epitaph */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Cross + project name row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "72px",
                  color: "#C4A07C",
                  lineHeight: 1,
                }}
              >
                {"\u2020"}
              </div>
              <div
                style={{
                  fontSize: "54px",
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
                gap: "16px",
                paddingLeft: "96px",
                fontSize: "22px",
                color: "#808080",
              }}
            >
              <div style={{ display: "flex" }}>{dateRange}</div>
              <div style={{ display: "flex", color: "#333" }}>{"\u00B7"}</div>
              <div style={{ display: "flex" }}>{project.causeOfDeath}</div>
            </div>

            {/* Epitaph */}
            <div
              style={{
                fontSize: "30px",
                fontStyle: "italic",
                color: "#b0b0b0",
                lineHeight: 1.5,
                paddingLeft: "96px",
                marginTop: "16px",
              }}
            >
              {`\u201C${project.epitaph}\u201D`}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #1e1e1e",
              paddingTop: "20px",
            }}
          >
            <div style={{ fontSize: "20px", color: "#808080" }}>
              {`Buried by @${username}`}
            </div>
            <div style={{ fontSize: "20px", color: "#555" }}>
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
