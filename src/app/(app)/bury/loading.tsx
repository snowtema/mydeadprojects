import { Skeleton } from "@/components/skeleton";

export default function BuryLoading() {
  return (
    <div>
      <Skeleton className="h-5 w-36 mb-1" />
      <div className="h-px bg-border mb-8" />

      <div className="space-y-8 max-w-lg">
        {/* Project Name */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1 rounded-md" />
            <Skeleton className="h-11 flex-1 rounded-md" />
          </div>
        </div>

        {/* Cause of Death grid */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* Epitaph */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* Submit */}
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
