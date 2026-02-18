import { Skeleton, SkeletonGrid } from "@/components/skeleton";

export default function UsernameLoading() {
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center space-y-3">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-4 py-3 border-y border-border">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* The Graveyard label */}
      <div>
        <div className="text-xs text-text-muted uppercase tracking-widest border-b border-border pb-3 mb-6">
          The Graveyard
        </div>
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}
