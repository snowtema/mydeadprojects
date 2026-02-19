import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/nav/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/actions/auth";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!profile) return {};

  const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/user/${profile.username}`;
  const description =
    profile.bio ||
    `${profile.projectsCount} projects buried by @${profile.username}. Rest in peace, dear code.`;

  return {
    title: `@${profile.username}'s Graveyard`,
    description,
    alternates: {
      canonical: `/${profile.username}`,
    },
    openGraph: {
      title: `@${profile.username}'s Graveyard | My Dead Projects`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `@${profile.username}'s Graveyard | My Dead Projects`,
      description,
      images: [ogImage],
    },
  };
}

export default async function UsernameLayout({ params, children }: Props) {
  const { username } = await params;

  const profile = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!profile) notFound();

  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <Navbar user={currentUser} />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      <Footer />
    </div>
  );
}
