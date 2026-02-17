import { type Project } from "@/lib/db/schema";
import { TombstoneCard } from "./tombstone-card";

interface GraveyardGridProps {
  projects: Project[];
  username: string;
  showEdit?: boolean;
}

export function GraveyardGrid({
  projects,
  username,
  showEdit,
}: GraveyardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <TombstoneCard
          key={project.id}
          project={project}
          username={username}
          showEdit={showEdit}
        />
      ))}
    </div>
  );
}
