import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDateRange } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return new Response("Not found", { status: 404 });
    }

    const recentProjects = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
      orderBy: [desc(projects.createdAt)],
      limit: 3,
    });

    const memberSince = user.createdAt.getFullYear();
    const remainingCount = Math.max(
      0,
      user.projectsCount - recentProjects.length
    );

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
              padding: "44px 64px",
            }}
          >
            {/* Top label */}
            <div
              style={{
                fontSize: "22px",
                color: "#C4A07C",
                letterSpacing: "0.3em",
                display: "flex",
                textTransform: "uppercase",
              }}
            >
              {`${user.displayName || user.username}\u2019s projects graveyard`}
            </div>

            {/* Middle: avatar + info + tombstones */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "28px",
              }}
            >
              {/* Avatar + Username row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "28px",
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    width={104}
                    height={104}
                    style={{
                      borderRadius: "52px",
                      border: "3px solid #C4A07C",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "104px",
                      height: "104px",
                      borderRadius: "52px",
                      border: "3px solid #C4A07C",
                      backgroundColor: "#141414",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "42px",
                    }}
                  >
                    {"\u{1FAA6}"}
                  </div>
                )}

                {/* Name + Bio */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "56px",
                      fontWeight: 700,
                      color: "#e8e8e8",
                      lineHeight: 1.1,
                      display: "flex",
                    }}
                  >
                    {`@${user.username}`}
                  </div>
                  {user.bio && (
                    <div
                      style={{
                        fontSize: "24px",
                        color: "#808080",
                        fontStyle: "italic",
                        lineHeight: 1.3,
                        display: "flex",
                      }}
                    >
                      {user.bio.length > 90
                        ? user.bio.slice(0, 87) + "..."
                        : user.bio}
                    </div>
                  )}
                </div>
              </div>

              {/* Tombstone mini-cards */}
              {recentProjects.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "14px 20px",
                        backgroundColor: "#141414",
                        border: "1px solid #1e1e1e",
                        borderRadius: "6px",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            color: "#C4A07C",
                            fontSize: "20px",
                            display: "flex",
                          }}
                        >
                          {"\u2020"}
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                            color: "#e8e8e8",
                            display: "flex",
                          }}
                        >
                          {project.name.length > 18
                            ? project.name.slice(0, 16) + "\u2026"
                            : project.name}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#555",
                          paddingLeft: "28px",
                          display: "flex",
                        }}
                      >
                        {formatDateRange(project.startDate, project.endDate)}
                      </div>
                    </div>
                  ))}

                  {remainingCount > 0 && (
                    <div
                      style={{
                        fontSize: "20px",
                        color: "#555",
                        paddingLeft: "8px",
                        display: "flex",
                      }}
                    >
                      {`+${remainingCount} more`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #1e1e1e",
                paddingTop: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
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
                    {`${user.projectsCount} buried`}
                  </div>
                </div>
                <div style={{ color: "#333", display: "flex" }}>
                  {"\u00B7"}
                </div>
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
                    {`${user.flowersReceived} respects`}
                  </div>
                </div>
                <div style={{ color: "#333", display: "flex" }}>
                  {"\u00B7"}
                </div>
                <div style={{ display: "flex" }}>{`since ${memberSince}`}</div>
              </div>
              <div style={{ fontSize: "22px", color: "#444", display: "flex" }}>
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
