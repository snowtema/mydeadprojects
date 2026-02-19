import { formatDateRange } from "@/lib/utils";

interface ResurrectionCertificateProps {
  projectName: string;
  epitaph: string;
  causeOfDeath: string;
  startDate: string;
  endDate: string;
  ownerUsername: string;
  necromancerUsername: string;
  resurrectedAt: Date;
  proofUrl?: string | null;
}

export function ResurrectionCertificate({
  projectName,
  epitaph,
  causeOfDeath,
  startDate,
  endDate,
  ownerUsername,
  necromancerUsername,
  resurrectedAt,
  proofUrl,
}: ResurrectionCertificateProps) {
  const dateRange = formatDateRange(startDate, endDate);
  const resurrectedDate = new Date(resurrectedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="resurrection-certificate border border-border rounded-md overflow-hidden">
      <div className="grid grid-cols-2 min-h-[200px]">
        {/* Left: Death side */}
        <div className="p-5 bg-bg-card border-r border-border space-y-3">
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-text-muted">
            Death Certificate
          </div>
          <div className="text-lg text-text-muted line-through decoration-1">
            {projectName}
          </div>
          <div className="text-xs text-text-muted font-light">{dateRange}</div>
          <div className="text-xs font-serif text-text-muted italic">
            &ldquo;{epitaph}&rdquo;
          </div>
          <div className="text-[0.65rem] text-text-muted/60">
            {causeOfDeath}
          </div>
          <div className="text-[0.6rem] text-text-muted/50 pt-2 border-t border-border/50">
            Buried by @{ownerUsername}
          </div>
        </div>

        {/* Right: Life side */}
        <div className="p-5 bg-green-dim/30 space-y-3">
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-green">
            Resurrection Certificate
          </div>
          <div className="text-lg text-green font-medium">{projectName}</div>
          <div className="text-xs text-green/70 font-light">
            Resurrected {resurrectedDate}
          </div>
          <div className="text-2xl text-green/80 text-center py-2">✦</div>
          {proofUrl && (
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-green hover:underline truncate"
            >
              IT LIVES &rarr;
            </a>
          )}
          <div className="text-[0.6rem] text-green/50 pt-2 border-t border-green/20">
            Necromancer: @{necromancerUsername}
          </div>
        </div>
      </div>
    </div>
  );
}
