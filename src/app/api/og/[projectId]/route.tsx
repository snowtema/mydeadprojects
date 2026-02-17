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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
          padding: "60px",
          border: "1px solid #1e1e1e",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#6a6a6a",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            DEATH CERTIFICATE
          </div>

          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#1e1e1e",
            }}
          />

          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#e0e0e0",
            }}
          >
            {project.name}
          </div>

          <div style={{ fontSize: "16px", color: "#999999" }}>
            {formatDateRange(project.startDate, project.endDate)}
          </div>

          <div
            style={{
              fontSize: "14px",
              color: "#6a6a6a",
              marginTop: "4px",
            }}
          >
            Cause of death: {project.causeOfDeath}
          </div>

          <div
            style={{
              width: "60%",
              height: "1px",
              backgroundColor: "#1e1e1e",
              margin: "8px 0",
            }}
          />

          <div
            style={{
              fontSize: "20px",
              color: "#999999",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: "1.6",
            }}
          >
            &ldquo;{project.epitaph}&rdquo;
          </div>

          <div
            style={{
              width: "60%",
              height: "1px",
              backgroundColor: "#1e1e1e",
              margin: "8px 0",
            }}
          />

          <div style={{ fontSize: "14px", color: "#6a6a6a" }}>
            Buried by @{user?.username || "unknown"}
          </div>

          <div
            style={{ fontSize: "12px", color: "#6a6a6a", marginTop: "16px" }}
          >
            🪦 mydeadprojects.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
