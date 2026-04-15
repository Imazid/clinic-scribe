import { NextResponse } from "next/server";
import { addToWaitlist, WaitlistError } from "@/lib/waitlist";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, source } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await addToWaitlist({
      name: name?.trim() || "",
      email: email.trim().toLowerCase(),
      role: role || "unknown",
      source: source || "website",
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    // Await the email so it completes before the serverless function freezes
    const emailResult = await sendWelcomeEmail({
      to: email.trim().toLowerCase(),
      name: name?.trim() || "",
    });

    if (!emailResult.success) {
      console.warn("[waitlist] Welcome email failed:", emailResult.error);
    }

    return NextResponse.json(result, { status: 201 });
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
