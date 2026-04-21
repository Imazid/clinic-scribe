import { NextResponse } from "next/server";
import { getWaitlistCount } from "@/lib/waitlist";

export const revalidate = 60;

export async function GET() {
  try {
    const count = await getWaitlistCount();
    return NextResponse.json(
      { count },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("[waitlist-count] failed to fetch count", err);
    return NextResponse.json({ count: null });
  }
}
