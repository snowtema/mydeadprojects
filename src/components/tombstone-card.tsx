import Link from "next/link";
import { type Project } from "@/lib/db/schema";
import { formatDateRange } from "@/lib/utils";
import { ResurrectionBadge } from "@/components/resurrection-badge";

interface TombstoneCardProps {
  project: Project;
  username: string;
  showEdit?: boolean;
}

function statusIcon(status: string, openForResurrection: boolean) {
  if (status === "resurrected") return "✦";
  if (status === "adopted") return "⚗";
  if (status === "dead" && openForResurrection) return "☽";
  return "✝";
}

function statusCardClass(status: string, openForResurrection: boolean) {
  if (status === "resurrected") return " tombstone-resurrected";
  if (status === "adopted") return " tombstone-adopted";
  if (status === "dead" && openForResurrection) return " tombstone-seeking";
  return "";
}

export function TombstoneCard({
  project,
  username,
  showEdit,
}: TombstoneCardProps) {
  const icon = statusIcon(project.status, project.openForResurrection);
  const cardClass = statusCardClass(project.status, project.openForResurrection);

  return (
    <div className="group relative">
      <Link
        href={`/${username}/${project.slug}`}
        className={`tombstone-card block p-6 border border-border rounded-t-md text-center transition-all duration-300 hover:border-border-hover hover:-translate-y-1${cardClass}`}
      >
        <div className={`text-lg mb-3 ${
          project.status === "resurrected"
            ? "text-green"
            : project.status === "adopted"
              ? "text-accent"
              : project.openForResurrection && project.status === "dead"
                ? "text-cta resurrection-pulse"
                : "tombstone-cross text-text-muted"
        }`}>{icon}</div>
        <div className="text-sm font-medium text-text-dim mb-1">
          {project.name}
        </div>
        <div className="text-xs text-text-muted font-light mb-2">
          {formatDateRange(project.startDate, project.endDate)}
        </div>
        <div className="text-sm font-serif text-text-dim italic leading-relaxed">
          &ldquo;{project.epitaph}&rdquo;
        </div>
        {project.causeOfDeath && (
          <div className="mt-3 inline-block text-xs px-2 py-0.5 bg-bg border border-border rounded text-text-muted">
            {project.causeOfDeath}
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-3 min-h-[20px]">
          <ResurrectionBadge
            status={project.status}
            openForResurrection={project.openForResurrection}
          />
        </div>
        <div className="mt-2 text-xs text-text-muted inline-flex items-center gap-2 justify-center w-full">
          <span className="inline-flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center w-4 h-4 glass-kbd border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">F</kbd>
            <span className="text-accent">{project.flowersCount}</span>
          </span>
          {project.openForResurrection && project.status === "dead" && project.resurrectionWishesCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-4 h-4 glass-kbd border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">R</kbd>
              <span className="text-green">{project.resurrectionWishesCount}</span>
            </span>
          )}
        </div>
      </Link>
      {/* Tombstone base */}
      <div className="tombstone-base mx-[10%] h-2 bg-bg border border-border border-t-0 rounded-b" />

      {showEdit && (
        <Link
          href={`/bury/${project.id}/edit`}
          className="absolute top-2 right-2 text-xs text-text-muted hover:text-text-dim opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity px-2 py-1 bg-bg-card border border-border rounded"
        >
          Edit
        </Link>
      )}
    </div>
  );
}
