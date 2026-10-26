import { NextRequest, NextResponse } from "next/server";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { isRequestAdmin } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  if (!isRequestAdmin(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Administrator credentials required." },
      { status: 401 }
    );
  }

  try {
    const cases = await RecoveryRepository.listCases({ isAdmin: true });
    return NextResponse.json({ success: true, cases });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch operational cases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isRequestAdmin(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Administrator credentials required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { caseId, adminIdentifier, notes } = body;

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "caseId is required to verify outcome." },
        { status: 400 }
      );
    }

    const verified = await RecoveryRepository.adminVerifyOutcome(
      caseId,
      adminIdentifier || "operations_admin",
      notes
    );

    return NextResponse.json({ success: true, case: verified });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to verify case outcome" },
      { status: 500 }
    );
  }
}
