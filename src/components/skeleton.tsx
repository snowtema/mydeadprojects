import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-bg-card", className)} />
  );
}

export function SkeletonTombstoneCard() {
  return (
    <div>
      <div className="p-6 border border-border rounded-t-md text-center space-y-3">
        {/* Cross */}
        <Skeleton className="w-5 h-5 mx-auto rounded-full" />
        {/* Name */}
        <Skeleton className="h-4 w-24 mx-auto" />
        {/* Dates */}
        <Skeleton className="h-3 w-32 mx-auto" />
        {/* Epitaph */}
        <Skeleton className="h-4 w-36 mx-auto" />
        {/* Cause */}
        <Skeleton className="h-4 w-20 mx-auto" />
        {/* Flowers */}
        <Skeleton className="h-3 w-10 mx-auto" />
      </div>
      {/* Base */}
      <div className="mx-[10%] h-2 bg-bg-card border border-border border-t-0 rounded-b animate-pulse" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTombstoneCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPersonRow() {
  return (
    <div className="flex items-start gap-3 py-4">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-64 max-w-full" />
        <div className="flex gap-3 pt-0.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPeopleList({ count = 10 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPersonRow key={i} />
      ))}
    </div>
  );
}
