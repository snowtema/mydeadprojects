"use client";

import { useTheme } from "@/components/theme-provider";

export function CodeMarketWidget() {
  const { resolved } = useTheme();

  return (
    <a
      href="https://code.market/product/my-dead-projects-a-graveyard-for-abandoned-ideas"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex justify-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          resolved === "dark"
            ? "https://code.market/assets/manage-product/featured-logo-dark.svg"
            : "https://code.market/assets/manage-product/featured-logo-bright.svg"
        }
        alt="Featured on Code Market"
        height={32}
        className="h-8 w-auto"
      />
    </a>
  );
}
