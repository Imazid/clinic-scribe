import { NextRequest, NextResponse } from "next/server";
import { getGenieClient } from "@/lib/genie";
import { handleGenieError } from "@/lib/genie/error-handler";
import { isValidFhirId } from "@/lib/genie/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidFhirId(id)) {
      return NextResponse.json(
        { error: "Invalid patient ID format" },
        { status: 400 }
      );
    }

    const client = getGenieClient();
    const patient = await client.getPatient(id);
    return NextResponse.json(patient);
  } catch (error) {
    return handleGenieError(error);
  }
}
