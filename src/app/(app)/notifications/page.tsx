import { getCurrentUser } from "@/actions/auth";
import {
  getNotifications,
  markNotificationsRead,
} from "@/actions/notifications";
import Link from "next/link";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Mark all as read on page visit
  await markNotificationsRead(user.id);

  const items = await getNotifications(user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-sm uppercase tracking-widest text-text-muted">
        Notifications
      </h1>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          No notifications yet.
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-md border transition-colors ${
                n.read
                  ? "border-transparent"
                  : "border-green/20 bg-green-dim/30"
              }`}
            >
              <span className="mt-0.5 text-sm">
                {n.type === "wish_milestone" ? "☽" : "✦"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-dim">{n.message}</p>
                {n.project?.user?.username && n.project?.slug && (
                  <Link
                    href={`/${n.project.user.username}/${n.project.slug}`}
                    className="text-xs text-text-muted hover:text-text-dim transition-colors"
                  >
                    View project &rarr;
                  </Link>
                )}
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatTimeAgo(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}
