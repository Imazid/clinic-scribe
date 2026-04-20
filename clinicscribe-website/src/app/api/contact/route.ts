import { NextResponse } from "next/server";
import { addContactMessage, ContactError } from "@/lib/contact";
import { sendContactEmail } from "@/lib/email";
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
  message: "Thanks — we'll get back to you shortly.",
};

export async function POST(request: Request) {
  const originReject = rejectIfBadOrigin(request);
  if (originReject) return originReject;

  const ip = clientIdentifier(request);
  const limit = await checkRateLimit(ip, "contact");
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
  const clinic = sanitizeString(body.clinic, FIELD_LIMITS.clinic);
  const topic =
    sanitizeString(body.topic, FIELD_LIMITS.topic) || "General enquiry";
  const message = sanitizeString(body.message, FIELD_LIMITS.message);
  const source =
    sanitizeString(body.source, FIELD_LIMITS.source) || "website";

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Please enter your name." },
      { status: 400 }
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { success: false, message: "Please add a message." },
      { status: 400 }
    );
  }

  try {
    await addContactMessage({ name, email, clinic, topic, message, source });

    const emailResult = await sendContactEmail({
      name,
      email,
      clinic,
      topic,
      message,
      source,
    });

    if (!emailResult.success) {
      console.warn(
        "[contact] Contact email notification failed:",
        emailResult.error
      );
    }

    return NextResponse.json(SUCCESS_RESPONSE, { status: 201 });
  } catch (error) {
    if (error instanceof ContactError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    console.error("Contact form submission failed", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
