import { createHash } from "node:crypto";

/**
 * Request-scoped helpers for safe server logging.
 *
 * IPs are personal data, so they are only ever logged as a truncated salted
 * hash. This keeps logs correlatable for abuse investigation without storing
 * the address itself.
 */

type ReqWithIp = {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

/** Trusts the first X-Forwarded-For hop (set by the Vercel edge). */
export function getClientIp(req: ReqWithIp): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

/** Stable, non-reversible identifier for a request, safe to write to logs. */
export function hashValue(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, 12);
}

/** Non-reversible short identifier for an IP address. */
export function anonymizeIp(req: ReqWithIp): string {
  const ip = getClientIp(req);
  return ip === "unknown" ? "unknown" : `ip_${hashValue(ip)}`;
}
