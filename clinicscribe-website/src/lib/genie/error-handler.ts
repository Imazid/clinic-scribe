import { NextResponse } from "next/server";
import { GenieAuthError, GenieApiError } from "./client";

/**
 * Shared error handler for Genie API routes.
 * Sanitizes error messages to avoid leaking internal details.
 */
export function handleGenieError(error: unknown): NextResponse {
  if (error instanceof GenieAuthError) {
    console.error("[Genie Auth Error]", error.message);
    return NextResponse.json(
      { error: "Genie authentication failed" },
      { status: 502 }
    );
  }

  if (error instanceof GenieApiError) {
    console.error("[Genie API Error]", error.statusCode, error.message);
    return NextResponse.json(
      { error: "Genie API request failed" },
      { status: error.statusCode >= 500 ? 502 : error.statusCode }
    );
  }

  if (error instanceof Error && error.message.includes("Missing required")) {
    console.error("[Genie Config Error]", error.message);
    return NextResponse.json(
      { error: "Genie integration not configured" },
      { status: 503 }
    );
  }

  console.error("[Genie Unknown Error]", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
