import { Skeleton, SkeletonGrid } from "@/components/skeleton";

export default function ExploreLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64 mt-2" />
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>

      <SkeletonGrid count={12} />
    </div>
  );
}
