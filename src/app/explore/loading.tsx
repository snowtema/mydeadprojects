import { Skeleton, SkeletonGrid } from "@/components/skeleton";

export default function ExploreLoading() {
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
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Cause filters */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded" />
        ))}
      </div>

      {/* View toggle */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      <SkeletonGrid count={12} />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-8 h-8 rounded" />
        ))}
      </div>
    </div>
  );
}
