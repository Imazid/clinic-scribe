import { NextRequest, NextResponse } from "next/server";
import { getGenieClient } from "@/lib/genie";
import { handleGenieError } from "@/lib/genie/error-handler";
import { parseCount } from "@/lib/genie/validation";

export async function GET(request: NextRequest) {
  try {
    const client = getGenieClient();
    const { searchParams } = new URL(request.url);

    const practitioners = await client.searchPractitioners({
      name: searchParams.get("name") ?? undefined,
      identifier: searchParams.get("identifier") ?? undefined,
      _count: parseCount(searchParams.get("_count"), 50),
    });

    return NextResponse.json(practitioners);
  } catch (error) {
    return handleGenieError(error);
  }
}
