import { NextRequest, NextResponse } from "next/server";
import { getGenieClient } from "@/lib/genie";
import { handleGenieError } from "@/lib/genie/error-handler";
import { parseCount } from "@/lib/genie/validation";

export async function GET(request: NextRequest) {
  try {
    const client = getGenieClient();
    const { searchParams } = new URL(request.url);

    const patients = await client.searchPatients({
      family: searchParams.get("family") ?? undefined,
      given: searchParams.get("given") ?? undefined,
      birthdate: searchParams.get("birthdate") ?? undefined,
      identifier: searchParams.get("identifier") ?? undefined,
      phone: searchParams.get("phone") ?? undefined,
      email: searchParams.get("email") ?? undefined,
      _count: parseCount(searchParams.get("_count"), 20),
    });

    return NextResponse.json(patients);
  } catch (error) {
    return handleGenieError(error);
  }
}
