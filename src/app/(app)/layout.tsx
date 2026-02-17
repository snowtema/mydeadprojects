import { Navbar } from "@/components/nav/navbar";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
