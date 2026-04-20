import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 16 * 1024;

export const FIELD_LIMITS = {
  name: 120,
  email: 254,
  role: 80,
  clinic: 160,
  topic: 80,
  message: 4000,
  source: 80,
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  if (host && originHost === host) return true;

  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return allowed.some((allowedOrigin) => {
    try {
      return new URL(allowedOrigin).host === originHost;
    } catch {
      return false;
    }
  });
}

export async function readJsonWithLimit(
  request: Request
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Request body too large." },
        { status: 413 }
      ),
    };
  }

  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: "Request body too large." },
          { status: 413 }
        ),
      };
    }

    return { ok: true, data: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      ),
    };
  }
}

export function rejectIfBadOrigin(request: Request): NextResponse | null {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Forbidden." },
      { status: 403 }
    );
  }
  return null;
}

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  const trap = body.website ?? body.company_url ?? body.fax;
  return typeof trap === "string" && trap.trim().length > 0;
}

export function sanitizeString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

interface RateLimitOk {
  ok: true;
  remaining?: number;
}
interface RateLimitFail {
  ok: false;
  response: NextResponse;
}

export async function checkRateLimit(
  identifier: string,
  bucket: string
): Promise<RateLimitOk | RateLimitFail> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return { ok: true };
  }

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({ url, token });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: false,
      prefix: `miraa:${bucket}`,
    });

    const result = await limiter.limit(identifier);
    if (!result.success) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            success: false,
            message: "Too many requests. Please try again later.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": "600",
              "X-RateLimit-Remaining": "0",
            },
          }
        ),
      };
    }

    return { ok: true, remaining: result.remaining };
  } catch (err) {
    console.warn("[rate-limit] check failed, allowing request:", err);
    return { ok: true };
  }
}

export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  if (!token) return false;

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    params.append("remoteip", ip);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: params }
    );

    if (!response.ok) return false;
    const data = (await response.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.warn("[turnstile] verify failed:", err);
    return false;
  }
}
