import Link from "next/link";
import { type ProjectWithUser } from "./explore-grid";
import { formatDateRange } from "@/lib/utils";
import { ResurrectionBadge } from "@/components/resurrection-badge";

interface ExploreTableProps {
  projects: ProjectWithUser[];
}

function Cell({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td className={className}>
      <Link href={href} className="block py-3 px-4">
        {children}
      </Link>
    </td>
  );
}

export function ExploreTable({ projects }: ExploreTableProps) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-card text-text-muted text-xs uppercase tracking-wider">
            <th className="text-left py-2.5 px-4 font-medium">Project</th>
            <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Dates</th>
            <th className="text-left py-2.5 px-4 font-medium hidden md:table-cell">Status</th>
            <th className="text-left py-2.5 px-4 font-medium hidden md:table-cell">Cause of Death</th>
            <th className="text-right py-2.5 px-4 font-medium w-16">
              <kbd className="inline-flex items-center justify-center w-4 h-4 glass-kbd border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">F</kbd>
            </th>
            <th className="text-left py-2.5 px-4 font-medium hidden lg:table-cell">Buried by</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.map((project) => {
            const href = `/${project.user.username}/${project.slug}`;
            return (
              <tr
                key={project.id}
                className="hover:bg-bg-card/50 transition-colors cursor-pointer"
              >
                <Cell href={href}>
                  <span className="text-text-dim font-medium">
                    {project.name}
                  </span>
                  <span className="block text-xs text-text-muted mt-0.5 font-serif italic truncate max-w-[280px]">
                    &ldquo;{project.epitaph}&rdquo;
                  </span>
                  {/* Mobile-only meta */}
                  <span className="flex items-center gap-3 mt-1 sm:hidden text-xs text-text-muted">
                    <span>{formatDateRange(project.startDate, project.endDate)}</span>
                    <span className="text-accent">{project.flowersCount}</span>
                  </span>
                </Cell>
                <Cell href={href} className="hidden sm:table-cell">
                  <span className="text-text-muted text-xs whitespace-nowrap">
                    {formatDateRange(project.startDate, project.endDate)}
                  </span>
                </Cell>
                <Cell href={href} className="hidden md:table-cell">
                  <ResurrectionBadge
                    status={project.status}
                    openForResurrection={project.openForResurrection}
                  />
                </Cell>
                <Cell href={href} className="hidden md:table-cell">
                  <span className="text-xs px-2 py-0.5 bg-bg border border-border rounded text-text-muted">
                    {project.causeOfDeath}
                  </span>
                </Cell>
                <Cell href={href} className="hidden sm:table-cell">
                  <span className="text-accent text-xs text-right block">
                    {project.flowersCount}
                  </span>
                </Cell>
                <Cell href={href} className="hidden lg:table-cell">
                  <span className="text-xs text-text-muted">
                    @{project.user.username}
                  </span>
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
