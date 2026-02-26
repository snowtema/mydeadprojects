import { ExploreClient } from "@/components/explore-client";
import { getExploreProjects, getExplorePeople } from "@/actions/explore";

type ProjectSort = "recent" | "flowers" | "wished";
type Section = "projects" | "seeking" | "people";

interface Props {
  searchParams: Promise<{
    sort?: string;
    page?: string;
    cause?: string;
    tab?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;

  const section: Section =
    params.tab === "seeking"
      ? "seeking"
      : params.tab === "people"
        ? "people"
        : "projects";

  const projectSort: ProjectSort =
    params.sort === "flowers"
      ? "flowers"
      : params.sort === "wished"
        ? "wished"
        : "recent";

  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const causeFilter = params.cause || null;

  let projectsData = null;
  let peopleData = null;

  if (section === "people") {
    const peopleSort =
      params.sort === "respected"
        ? "respected" as const
        : params.sort === "buried"
          ? "buried" as const
          : "recent" as const;
    peopleData = await getExplorePeople({ sort: peopleSort, cursor: null });
  } else {
    const tab = section === "seeking" ? "seeking" as const : "all" as const;
    projectsData = await getExploreProjects({
      tab,
      sort: projectSort,
      cause: causeFilter,
      page: currentPage,
    });
  }

  return (
    <ExploreClient
      initialSection={section}
      initialProjectSort={projectSort}
      initialCause={causeFilter}
      initialPage={currentPage}
      initialProjectsData={projectsData}
      initialPeopleData={peopleData}
    />
  );
}
