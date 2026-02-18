import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://mydeadprojects.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/explore`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // All user profiles
  const allUsers = await db.query.users.findMany({
    columns: { username: true, updatedAt: true },
  });

  const userPages: MetadataRoute.Sitemap = allUsers.map((user) => ({
    url: `${BASE_URL}/${user.username}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // All project pages
  const allProjects = await db.query.projects.findMany({
    columns: { slug: true, updatedAt: true, userId: true },
    orderBy: [desc(projects.createdAt)],
    with: { user: { columns: { username: true } } },
  });

  const projectPages: MetadataRoute.Sitemap = allProjects.map((project) => ({
    url: `${BASE_URL}/${project.user.username}/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...userPages, ...projectPages];
}
