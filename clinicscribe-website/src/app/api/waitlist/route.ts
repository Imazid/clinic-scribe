import { NextResponse } from "next/server";
import { addToWaitlist, WaitlistError } from "@/lib/waitlist";
import { sendWelcomeEmail } from "@/lib/email";
import {
  EMAIL_REGEX,
  FIELD_LIMITS,
  checkRateLimit,
  clientIdentifier,
  isHoneypotTriggered,
  readJsonWithLimit,
  rejectIfBadOrigin,
  sanitizeString,
  verifyTurnstile,
} from "@/lib/apiSecurity";

const SUCCESS_RESPONSE = {
  success: true,
  message: "You're on the list!",
};

export async function POST(request: Request) {
  const originReject = rejectIfBadOrigin(request);
  if (originReject) return originReject;

  const ip = clientIdentifier(request);
  const limit = await checkRateLimit(ip, "waitlist");
  if (!limit.ok) return limit.response;

  const parsed = await readJsonWithLimit(request);
  if (!parsed.ok) return parsed.response;

  const body = (parsed.data as Record<string, unknown>) ?? {};

  if (isHoneypotTriggered(body)) {
    return NextResponse.json(SUCCESS_RESPONSE, { status: 201 });
  }

  const turnstileToken = sanitizeString(body.turnstileToken, 2048);
  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { success: false, message: "Captcha verification failed." },
      { status: 400 }
    );
  }

  const name = sanitizeString(body.name, FIELD_LIMITS.name);
  const email = sanitizeString(body.email, FIELD_LIMITS.email).toLowerCase();
  const role = sanitizeString(body.role, FIELD_LIMITS.role) || "unknown";
  const source =
    sanitizeString(body.source, FIELD_LIMITS.source) || "website";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const result = await addToWaitlist({ name, email, role, source });

    if (result.success) {
      const emailResult = await sendWelcomeEmail({ to: email, name });
      if (!emailResult.success) {
        console.warn("[waitlist] Welcome email failed:", emailResult.error);
      }
    }

    return NextResponse.json(SUCCESS_RESPONSE, { status: 201 });
  } catch (error) {
    if (error instanceof WaitlistError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    console.error("Waitlist submission failed", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
