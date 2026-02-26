import { Navbar } from "@/components/nav/navbar";
import { getCurrentUser } from "@/actions/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore — Recently Buried Projects",
  description: "Discover dead projects buried by the community.",
};

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex-1">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
