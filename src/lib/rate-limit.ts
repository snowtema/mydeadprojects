import { redis } from "./redis";
import { headers } from "next/headers";

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * Simple sliding window rate limiter using Redis.
 * @param key - unique key prefix (e.g. "condolence", "flower")
 * @param limit - max requests allowed in the window
 * @param windowSeconds - time window in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const redisKey = `rl:${key}:${ip}`;

  try {
    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  } catch {
    // If Redis is down, allow the request (fail open)
    return { success: true, remaining: limit };
  }
}
