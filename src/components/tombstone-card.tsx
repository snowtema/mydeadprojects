import Link from "next/link";
import { type Project } from "@/lib/db/schema";
import { formatDateRange } from "@/lib/utils";

interface TombstoneCardProps {
  project: Project;
  username: string;
  showEdit?: boolean;
}

export function TombstoneCard({
  project,
  username,
  showEdit,
}: TombstoneCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/${username}/${project.slug}`}
        className="block p-6 bg-bg-card border border-border rounded-t-md text-center transition-all duration-200 hover:border-border-hover hover:-translate-y-0.5"
      >
        <div className="text-text-muted text-lg mb-3">&#10013;</div>
        <div className="text-sm font-medium text-text-dim mb-1">
          {project.name}
        </div>
        <div className="text-[0.6rem] text-text-muted font-light mb-2">
          {formatDateRange(project.startDate, project.endDate)}
        </div>
        <div className="text-[0.6rem] text-text-muted italic leading-relaxed">
          &ldquo;{project.epitaph}&rdquo;
        </div>
        {project.causeOfDeath && (
          <div className="mt-3 inline-block text-[0.6rem] px-2 py-0.5 bg-bg border border-border rounded text-text-muted">
            {project.causeOfDeath}
          </div>
        )}
        <div className="mt-3 text-[0.6rem] text-text-muted">
          🌸 {project.flowersCount}
        </div>
      </Link>
      {/* Tombstone base */}
      <div className="mx-[10%] h-2 bg-bg-subtle border border-border border-t-0 rounded-b" />

      {showEdit && (
        <Link
          href={`/bury/${project.id}/edit`}
          className="absolute top-2 right-2 text-[0.6rem] text-text-muted hover:text-text-dim opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-bg-card border border-border rounded"
        >
          Edit
        </Link>
      )}
    </div>
  );
}
