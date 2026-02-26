"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExploreViewToggle } from "./explore-view-toggle";
import {
  getExploreProjects,
  getExplorePeople,
  type ProjectWithUser,
  type PersonItem,
  type ExploreProjectsResult,
  type ExplorePeopleResult,
} from "@/actions/explore";

type Section = "projects" | "seeking" | "people";
type ProjectSort = "recent" | "flowers" | "wished";
type PeopleSort = "recent" | "respected" | "buried";

interface ExploreClientProps {
  initialSection: Section;
  initialProjectSort: ProjectSort;
  initialCause: string | null;
  initialPage: number;
  initialProjectsData: ExploreProjectsResult | null;
  initialPeopleData: ExplorePeopleResult | null;
}

export function ExploreClient({
  initialSection,
  initialProjectSort,
  initialCause,
  initialPage,
  initialProjectsData,
  initialPeopleData,
}: ExploreClientProps) {
  const [isPending, startTransition] = useTransition();

  // Section state
  const [section, setSection] = useState<Section>(initialSection);

  // Projects state
  const [projectSort, setProjectSort] = useState<ProjectSort>(initialProjectSort);
  const [cause, setCause] = useState<string | null>(initialCause);
  const [page, setPage] = useState(initialPage);
  const [projects, setProjects] = useState<ProjectWithUser[]>(
    initialProjectsData?.rows ?? []
  );
  const [causes, setCauses] = useState<string[]>(
    initialProjectsData?.causes ?? []
  );
  const [totalPages, setTotalPages] = useState(
    initialProjectsData?.totalPages ?? 1
  );

  // People state
  const [peopleSort, setPeopleSort] = useState<PeopleSort>("recent");
  const [people, setPeople] = useState<PersonItem[]>(
    initialPeopleData?.items ?? []
  );
  const [peopleCursor, setPeopleCursor] = useState<string | null>(
    initialPeopleData?.nextCursor ?? null
  );
  const [peopleLoaded, setPeopleLoaded] = useState(initialSection === "people");

  // URL sync
  const buildUrl = useCallback(
    (s: Section, sort: string, c: string | null, p: number) => {
      const params = new URLSearchParams();
      if (s === "seeking") params.set("tab", "seeking");
      if (s === "people") params.set("tab", "people");
      if (s !== "people") {
        if (sort !== "recent") params.set("sort", sort);
        if (c) params.set("cause", c);
        if (p > 1) params.set("page", String(p));
      } else {
        if (sort !== "recent") params.set("sort", sort);
      }
      const qs = params.toString();
      return `/explore${qs ? `?${qs}` : ""}`;
    },
    []
  );

  const syncUrl = useCallback(
    (s: Section, sort: string, c: string | null, p: number) => {
      const url = buildUrl(s, sort, c, p);
      window.history.replaceState(null, "", url);
    },
    [buildUrl]
  );

  // Fetch projects
  const fetchProjects = useCallback(
    (s: Section, sort: ProjectSort, c: string | null, p: number) => {
      startTransition(async () => {
        const tab = s === "seeking" ? "seeking" : "all";
        const data = await getExploreProjects({ tab, sort, cause: c, page: p });
        setProjects(data.rows);
        setCauses(data.causes);
        setTotalPages(data.totalPages);
        // Correct page if it exceeds total
        if (p > data.totalPages) setPage(data.totalPages);
      });
    },
    []
  );

  // Fetch people
  const fetchPeople = useCallback(
    (sort: PeopleSort, cursor: string | null, append: boolean) => {
      startTransition(async () => {
        const data = await getExplorePeople({ sort, cursor });
        if (append) {
          setPeople((prev) => [...prev, ...data.items]);
        } else {
          setPeople(data.items);
        }
        setPeopleCursor(data.nextCursor);
        setPeopleLoaded(true);
      });
    },
    []
  );

  // Section change
  const handleSectionChange = useCallback(
    (newSection: Section) => {
      setSection(newSection);
      if (newSection === "people") {
        syncUrl(newSection, peopleSort, null, 1);
        if (!peopleLoaded) {
          fetchPeople(peopleSort, null, false);
        }
      } else {
        const newSort: ProjectSort = "recent";
        setProjectSort(newSort);
        setCause(null);
        setPage(1);
        syncUrl(newSection, newSort, null, 1);
        fetchProjects(newSection, newSort, null, 1);
      }
    },
    [peopleSort, peopleLoaded, fetchProjects, fetchPeople, syncUrl]
  );

  // Project sort change
  const handleProjectSortChange = useCallback(
    (newSort: ProjectSort) => {
      setProjectSort(newSort);
      setPage(1);
      syncUrl(section, newSort, cause, 1);
      fetchProjects(section, newSort, cause, 1);
    },
    [section, cause, fetchProjects, syncUrl]
  );

  // Cause filter change
  const handleCauseChange = useCallback(
    (newCause: string | null) => {
      setCause(newCause);
      setPage(1);
      syncUrl(section, projectSort, newCause, 1);
      fetchProjects(section, projectSort, newCause, 1);
    },
    [section, projectSort, fetchProjects, syncUrl]
  );

  // Page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      syncUrl(section, projectSort, cause, newPage);
      fetchProjects(section, projectSort, cause, newPage);
    },
    [section, projectSort, cause, fetchProjects, syncUrl]
  );

  // People sort change
  const handlePeopleSortChange = useCallback(
    (newSort: PeopleSort) => {
      setPeopleSort(newSort);
      setPeopleCursor(null);
      syncUrl("people", newSort, null, 1);
      fetchPeople(newSort, null, false);
    },
    [fetchPeople, syncUrl]
  );

  // People load more
  const handleLoadMore = useCallback(() => {
    if (peopleCursor) {
      fetchPeople(peopleSort, peopleCursor, true);
    }
  }, [peopleSort, peopleCursor, fetchPeople]);

  // Sort tabs config
  const projectSortTabs: { key: ProjectSort; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "flowers", label: "Most Respected" },
    ...(section === "seeking"
      ? [{ key: "wished" as ProjectSort, label: "Most Wished" }]
      : []),
  ];

  const peopleSortTabs: { key: PeopleSort; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "respected", label: "Most Respected" },
    { key: "buried", label: "Most Buried" },
  ];

  const isProjectsSection = section === "projects" || section === "seeking";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium">Explore</h1>
        <p className="text-sm text-text-muted mt-1">
          {section === "people"
            ? "Developers who buried their dead projects."
            : "Recently buried projects from the community."}
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => handleSectionChange("projects")}
          className={cn(
            "text-sm pb-3 border-b-2 transition-colors -mb-px",
            section === "projects"
              ? "border-accent text-text-dim"
              : "border-transparent text-text-muted hover:text-text-dim"
          )}
        >
          Projects
        </button>
        <button
          onClick={() => handleSectionChange("seeking")}
          className={cn(
            "text-sm pb-3 border-b-2 transition-colors -mb-px",
            section === "seeking"
              ? "border-green text-green"
              : "border-transparent text-text-muted hover:text-text-dim"
          )}
        >
          Seeking Revival
        </button>
        <button
          onClick={() => handleSectionChange("people")}
          className={cn(
            "text-sm pb-3 border-b-2 transition-colors -mb-px",
            section === "people"
              ? "border-accent text-text-dim"
              : "border-transparent text-text-muted hover:text-text-dim"
          )}
        >
          People
        </button>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 border-b border-border">
        {(isProjectsSection ? projectSortTabs : peopleSortTabs).map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              isProjectsSection
                ? handleProjectSortChange(tab.key as ProjectSort)
                : handlePeopleSortChange(tab.key as PeopleSort)
            }
            className={cn(
              "text-sm pb-3 border-b-2 transition-colors -mb-px",
              (isProjectsSection ? projectSort : peopleSort) === tab.key
                ? "border-accent text-text-dim"
                : "border-transparent text-text-muted hover:text-text-dim"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cause filter (projects only) */}
      {isProjectsSection && causes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCauseChange(null)}
            className={cn(
              "text-xs px-2.5 py-1 rounded border transition-colors",
              !cause
                ? "bg-accent/10 border-accent text-accent"
                : "bg-bg-card border-border text-text-muted hover:border-border-hover hover:text-text-dim"
            )}
          >
            All
          </button>
          {causes.map((c) => (
            <button
              key={c}
              onClick={() => handleCauseChange(cause === c ? null : c)}
              className={cn(
                "text-xs px-2.5 py-1 rounded border transition-colors",
                cause === c
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-bg-card border-border text-text-muted hover:border-border-hover hover:text-text-dim"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "transition-opacity duration-200",
          isPending ? "opacity-60" : "opacity-100"
        )}
      >
        {isProjectsSection ? (
          <>
            {projects.length > 0 ? (
              <ExploreViewToggle projects={projects} />
            ) : (
              <p className="text-center text-text-muted text-sm py-12">
                {cause
                  ? `No projects with cause "${cause}" found.`
                  : "No projects buried yet. Be the first!"}
              </p>
            )}

            <ClientPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <>
            {people.length > 0 ? (
              <div className="divide-y divide-border">
                {people.map((person) => (
                  <Link
                    key={person.id}
                    href={`/${person.username}`}
                    className="flex items-start gap-3 py-4 group hover:bg-bg-card -mx-2 px-2 rounded-md transition-colors"
                  >
                    {person.avatarUrl ? (
                      <Image
                        src={person.avatarUrl}
                        alt={person.username}
                        width={36}
                        height={36}
                        className="rounded-full border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center text-sm shrink-0">
                        🪦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-dim group-hover:text-text transition-colors">
                        @{person.username}
                        {person.displayName && (
                          <span className="ml-2 text-xs text-text-muted font-normal">
                            {person.displayName}
                          </span>
                        )}
                      </div>
                      {person.bio && (
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {person.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                        <span>{person.projectsCount} buried</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          {person.flowersReceived}{" "}
                          <kbd className="inline-flex items-center justify-center w-4 h-4 glass-kbd border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">
                            F
                          </kbd>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted text-sm py-12">
                No people found.
              </p>
            )}

            {peopleCursor && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isPending}
                  className="text-sm px-6 py-2.5 bg-bg-card border border-border rounded-md text-text-dim hover:border-border-hover transition-colors disabled:opacity-50"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Client-side pagination
function ClientPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1 pt-8"
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 text-text-muted hover:text-text-dim transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-text-muted text-sm select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              "min-w-[32px] h-8 flex items-center justify-center text-sm rounded border transition-colors",
              currentPage === p
                ? "bg-accent/10 border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-dim hover:border-border"
            )}
            aria-current={currentPage === p ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 text-text-muted hover:text-text-dim transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </nav>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
