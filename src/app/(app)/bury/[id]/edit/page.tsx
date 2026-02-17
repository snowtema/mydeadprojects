import { BuryForm } from "@/components/bury-form";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/actions/auth";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Project",
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, user.id)),
  });

  if (!project) notFound();

  return (
    <div>
      <h1 className="text-lg font-medium mb-1">Edit Project</h1>
      <div className="h-px bg-border mb-8" />
      <BuryForm existingProject={project} />
    </div>
  );
}
