import { NextResponse } from "next/server";
import { addContactMessage, ContactError } from "@/lib/contact";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const clinic = body.clinic?.trim() || "";
    const topic = body.topic?.trim() || "General enquiry";
    const message = body.message?.trim() || "";
    const source = body.source?.trim() || "website";

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    const result = await addContactMessage({
      name,
      email,
      clinic,
      topic,
      message,
      source,
    });

    const emailResult = await sendContactEmail({
      name,
      email,
      clinic,
      topic,
      message,
      source,
    });

    if (!emailResult.success) {
      console.warn("[contact] Contact email notification failed:", emailResult.error);
    }

    return NextResponse.json(result, { status: 201 });
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
