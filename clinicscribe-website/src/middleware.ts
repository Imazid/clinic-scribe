import { NextRequest, NextResponse } from "next/server";

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

  if (!providedKey || providedKey !== apiKey) {
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
