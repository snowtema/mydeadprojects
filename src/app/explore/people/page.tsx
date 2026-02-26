import { ExploreClient } from "@/components/explore-client";
import { getExplorePeople } from "@/actions/explore";

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function ExplorePeoplePage({ searchParams }: Props) {
  const params = await searchParams;

  const peopleSort =
    params.sort === "respected"
      ? "respected" as const
      : params.sort === "buried"
        ? "buried" as const
        : "recent" as const;

  const peopleData = await getExplorePeople({ sort: peopleSort, cursor: null });

  return (
    <ExploreClient
      initialSection="people"
      initialProjectSort="recent"
      initialCause={null}
      initialPage={1}
      initialProjectsData={null}
      initialPeopleData={peopleData}
    />
  );
}
