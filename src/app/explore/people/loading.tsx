import { Skeleton, SkeletonPeopleList } from "@/components/skeleton";

export default function ExplorePeopleLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64 mt-2" />
      </div>

      {/* Section tabs */}
      <div className="flex gap-6 border-b border-border pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-22" />
      </div>

      <SkeletonPeopleList count={10} />
    </div>
  );
}
