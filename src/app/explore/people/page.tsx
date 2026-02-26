import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function ExplorePeoplePage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = params.sort;
  const url = sort ? `/explore?tab=people&sort=${sort}` : `/explore?tab=people`;
  redirect(url);
}
