import { type SVGProps } from "react";

export function TombstoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Tombstone shape: rounded top, flat bottom */}
      <path d="M6 22V8a6 6 0 0 1 12 0v14" />
      <line x1="6" y1="22" x2="18" y2="22" />
      {/* Cross */}
      <line x1="12" y1="7" x2="12" y2="15" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  );
}
