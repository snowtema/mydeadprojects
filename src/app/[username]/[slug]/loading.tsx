import { Skeleton } from "@/components/skeleton";

export default function ProjectLoading() {
  return (
    <div className="space-y-8">
      {/* Back link */}
      <Skeleton className="h-3 w-36" />

      {/* Large Tombstone */}
      <div className="max-w-xs mx-auto">
        <div className="p-8 border border-border rounded-t-md text-center space-y-3">
          <Skeleton className="w-7 h-7 mx-auto rounded-full" />
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-3 w-28 mx-auto" />
          <Skeleton className="h-5 w-44 mx-auto" />
        </div>
        <div className="mx-[10%] h-2 bg-bg-card border border-border border-t-0 rounded-b animate-pulse" />
      </div>

      {/* Details */}
      <div className="max-w-lg mx-auto space-y-4">
        {/* Cause */}
        <div className="flex justify-center">
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Tech pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded" />
          ))}
        </div>

        {/* Description lines */}
        <div className="border-t border-border pt-4 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
