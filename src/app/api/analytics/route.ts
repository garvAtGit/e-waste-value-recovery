import { NextResponse } from "next/server";
import { computePlatformAnalytics } from "@/lib/analytics/engine";

export async function GET() {
  try {
    const analytics = await computePlatformAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to compute analytics" },
      { status: 500 }
    );
  }
}
