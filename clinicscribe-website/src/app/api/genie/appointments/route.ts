import { NextRequest, NextResponse } from "next/server";
import { getGenieClient } from "@/lib/genie";
import { handleGenieError } from "@/lib/genie/error-handler";
import { parseCount } from "@/lib/genie/validation";

export async function GET(request: NextRequest) {
  try {
    const client = getGenieClient();
    const { searchParams } = new URL(request.url);

    const appointments = await client.searchAppointments({
      patient: searchParams.get("patient") ?? undefined,
      practitioner: searchParams.get("practitioner") ?? undefined,
      date: searchParams.get("date") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      _count: parseCount(searchParams.get("_count"), 50),
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return handleGenieError(error);
  }
}
