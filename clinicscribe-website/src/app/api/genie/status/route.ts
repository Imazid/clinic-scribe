import { NextResponse } from "next/server";

/**
 * GET /api/genie/status
 *
 * Health check endpoint to verify Genie integration configuration.
 * Does not make actual API calls — just checks if env vars are present.
 * Returns only a boolean status — no internal details are exposed.
 */
export async function GET() {
  const required = [
    "GENIE_CLIENT_ID",
    "GENIE_CLIENT_SECRET",
    "GENIE_FHIR_BASE_URL",
    "GENIE_TOKEN_URL",
  ];

  const configured = required.every((key) => !!process.env[key]);

  return NextResponse.json({
    integration: "genie-solutions",
    configured,
  });
}
