import { NextRequest, NextResponse } from "next/server";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Middleware to protect /api/genie/* routes with API key authentication.
 *
 * Requires the GENIE_API_KEY env var to be set.
 * Clients must pass the key via the `x-api-key` header.
 */
export function middleware(request: NextRequest) {
  const apiKey = process.env.GENIE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API authentication not configured" },
      { status: 503 }
    );
  }

  const providedKey = request.headers.get("x-api-key");

  if (!providedKey || !safeEqual(providedKey, apiKey)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/genie/:path*",
};
