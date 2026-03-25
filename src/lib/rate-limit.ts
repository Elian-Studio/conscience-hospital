const rateMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, max: 60 }
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateMap.set(key, { count: 1, resetTime: now + options.windowMs });
    return { success: true, remaining: options.max - 1 };
  }

  entry.count++;

  if (entry.count > options.max) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: options.max - entry.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
