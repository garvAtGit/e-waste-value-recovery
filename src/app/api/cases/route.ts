import { NextRequest, NextResponse } from "next/server";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { CreateCaseInput } from "@/lib/recovery-cases/types";
import { getSessionIdentifier, isRequestAdmin } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionIdentifier(request);
    const searchParams = request.nextUrl.searchParams;
    const pathwayId = searchParams.get("pathwayId") || undefined;
    const status = searchParams.get("status") || undefined;

    const cases = await RecoveryRepository.listCases({
      sessionId,
      pathwayId,
      status,
    });

    return NextResponse.json({ success: true, cases });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch recovery cases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isAdmin = isRequestAdmin(request);
    // Non-admin callers cannot override the session identifier to impersonate another session
    const sessionId = (isAdmin && body.sessionId) ? body.sessionId : getSessionIdentifier(request);

    const { pathwayId, providerId, assessmentInput, savedAssessmentId, userNotes } = body;

    if (!pathwayId) {
      return NextResponse.json(
        { success: false, error: "A recovery pathwayId is required to initiate a recovery case." },
        { status: 400 }
      );
    }

    // HAZARDOUS SAFEGUARD: Enforce that hazardous devices cannot be placed into commercial recovery pathways
    if (assessmentInput?.condition === "unsafe_hazardous") {
      const forbiddenCommercialPathways = [
        "sell-cash",
        "exchange-voucher",
        "repair",
        "refurbishers-parts",
        "donate-reuse",
      ];

      if (forbiddenCommercialPathways.includes(pathwayId)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Hazardous Safety Violation: Devices with compromised, swollen, or leaking lithium batteries or dangerous electrical faults are legally prohibited from commercial resale, trade-in, courier transport, or standard repair. They must be routed exclusively to certified hazardous material handling facilities.",
            isHazardousBlocked: true,
          },
          { status: 400 }
        );
      }
    }

    const input: CreateCaseInput = {
      sessionId,
      pathwayId,
      providerId: providerId || null,
      assessmentInput,
      savedAssessmentId,
      userNotes,
    };

    const newCase = await RecoveryRepository.createCase(input);

    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create recovery case" },
      { status: 500 }
    );
  }
}
