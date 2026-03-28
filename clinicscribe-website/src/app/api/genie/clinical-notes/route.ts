import { NextRequest, NextResponse } from "next/server";
import { getGenieClient } from "@/lib/genie";
import type { GenieLetterPayload } from "@/lib/genie";
import { handleGenieError } from "@/lib/genie/error-handler";
import {
  isValidFhirId,
  isContentWithinLimit,
  stripHtml,
} from "@/lib/genie/validation";

export async function POST(request: NextRequest) {
  try {
    const client = getGenieClient();
    const body = await request.json();

    const { patientId, practitionerId, letterType, title, content } =
      body as Partial<GenieLetterPayload>;

    if (!patientId || !title || !content) {
      return NextResponse.json(
        { error: "patientId, title, and content are required" },
        { status: 400 }
      );
    }

    if (!isValidFhirId(patientId)) {
      return NextResponse.json(
        { error: "Invalid patientId format" },
        { status: 400 }
      );
    }

    if (practitionerId && !isValidFhirId(practitionerId)) {
      return NextResponse.json(
        { error: "Invalid practitionerId format" },
        { status: 400 }
      );
    }

    if (!isContentWithinLimit(content)) {
      return NextResponse.json(
        { error: "Content exceeds maximum allowed size (100 KB)" },
        { status: 413 }
      );
    }

    const validLetterTypes = [
      "clinical-note",
      "referral",
      "discharge-summary",
      "correspondence",
    ];
    const resolvedType =
      letterType && validLetterTypes.includes(letterType)
        ? letterType
        : "clinical-note";

    // Always push as text/plain with HTML stripped to prevent stored XSS
    const sanitizedContent = stripHtml(content);
    const sanitizedTitle = stripHtml(title);

    const result = await client.pushClinicalNote({
      patientId,
      practitionerId,
      letterType: resolvedType,
      title: sanitizedTitle,
      content: sanitizedContent,
      contentType: "text/plain",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleGenieError(error);
  }
}
