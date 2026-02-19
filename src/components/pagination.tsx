import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="p-2 text-text-muted hover:text-text-dim transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </a>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-text-muted text-sm select-none"
          >
            ...
          </span>
        ) : (
          <a
            key={page}
            href={buildUrl(page as number)}
            className={cn(
              "min-w-[32px] h-8 flex items-center justify-center text-sm rounded border transition-colors",
              currentPage === page
                ? "bg-accent/10 border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-dim hover:border-border"
            )}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </a>
        )
      )}

      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="p-2 text-text-muted hover:text-text-dim transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </a>
      )}
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}
