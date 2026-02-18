import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { projects, users, flowers } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [projectsResult, usersResult, flowersResult, randomGraves] =
      await Promise.all([
        db.select({ value: count() }).from(projects),
        db.select({ value: count() }).from(users),
        db.select({ value: count() }).from(flowers),
        db.query.projects.findMany({
          orderBy: sql`RANDOM()`,
          limit: 5,
          columns: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        }),
      ]);

    const stats = {
      projects: projectsResult[0]?.value ?? 0,
      developers: usersResult[0]?.value ?? 0,
      respects: flowersResult[0]?.value ?? 0,
    };

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
            fontFamily: "monospace",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 64px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              marginBottom: "52px",
            }}
          >
            <div style={{ fontSize: "52px", display: "flex" }}>
              {"\u{1FAA6}"}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "52px",
                lineHeight: 1.1,
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#e8e8e8", display: "flex" }}
              >
                my
              </div>
              <div
                style={{ fontWeight: 300, color: "#666", display: "flex" }}
              >
                dead
              </div>
              <div
                style={{ fontWeight: 700, color: "#e8e8e8", display: "flex" }}
              >
                projects
              </div>
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "#808080",
                fontWeight: 300,
                letterSpacing: "0.05em",
                display: "flex",
              }}
            >
              a graveyard for abandoned side projects
            </div>
          </div>

          {/* Tombstones row */}
          {randomGraves.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "52px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-end",
                }}
              >
                {randomGraves.map((grave) => (
                  <div
                    key={grave.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "14px 18px 10px",
                        backgroundColor: "#151515",
                        border: "1px solid #222",
                        borderRadius: "6px 6px 0 0",
                        gap: "2px",
                        width: "168px",
                      }}
                    >
                      <div
                        style={{
                          color: "#C4A07C",
                          fontSize: "16px",
                          display: "flex",
                        }}
                      >
                        {"\u2720"}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#ccc",
                          textAlign: "center",
                          display: "flex",
                        }}
                      >
                        {grave.name.length > 16
                          ? grave.name.slice(0, 14) + "\u2026"
                          : grave.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#555",
                          display: "flex",
                        }}
                      >
                        {`${grave.startDate.slice(0, 4)} \u2013 ${grave.endDate.slice(0, 4)}`}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "184px",
                        height: "5px",
                        backgroundColor: "#111",
                        border: "1px solid #222",
                        borderTop: "none",
                        borderRadius: "0 0 2px 2px",
                        display: "flex",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Ground line */}
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "#1a1a1a",
                  marginTop: "8px",
                  display: "flex",
                }}
              />
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              fontSize: "22px",
              color: "#808080",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ color: "#C4A07C", display: "flex" }}>
                {"\u2020"}
              </div>
              <div style={{ display: "flex" }}>
                {`${stats.projects} projects buried`}
              </div>
            </div>
            <div style={{ color: "#333", display: "flex" }}>{"\u00B7"}</div>
            <div style={{ display: "flex" }}>
              {`${stats.developers} developers`}
            </div>
            <div style={{ color: "#333", display: "flex" }}>{"\u00B7"}</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ color: "#9B7E7E", display: "flex" }}>
                {"\u273F"}
              </div>
              <div style={{ display: "flex" }}>
                {`${stats.respects} respects paid`}
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
