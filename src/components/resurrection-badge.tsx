interface ResurrectionBadgeProps {
  status: string;
  openForResurrection: boolean;
}

export function ResurrectionBadge({
  status,
  openForResurrection,
}: ResurrectionBadgeProps) {
  if (status === "resurrected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green">
        <span className="w-1.5 h-1.5 rounded-full bg-green" />
        Resurrected
      </span>
    );
  }

  if (status === "adopted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-yellow">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow" />
        Adopted
      </span>
    );
  }

  if (status === "dead" && openForResurrection) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green">
        <span className="w-1.5 h-1.5 rounded-full bg-green resurrection-pulse" />
        Seeking Revival
      </span>
    );
  }

  return null;
}
