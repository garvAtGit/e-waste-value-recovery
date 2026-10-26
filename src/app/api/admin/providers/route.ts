import { NextRequest, NextResponse } from "next/server";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { isRequestAdmin } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  if (!isRequestAdmin(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Administrator credentials required to view full provider candidate registry." },
      { status: 401 }
    );
  }

  try {
    const providers = await RecoveryRepository.listCandidateProviders();
    return NextResponse.json({ success: true, providers });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch candidate providers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isRequestAdmin(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Administrator credentials required to modify provider status." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { providerId, status, verificationStatus, notes, adminIdentifier } = body;

    if (!providerId || !status || !verificationStatus) {
      return NextResponse.json(
        { success: false, error: "providerId, status ('approved'|'rejected'), and verificationStatus are required." },
        { status: 400 }
      );
    }

    const updated = await RecoveryRepository.updateCandidateStatus(
      providerId,
      status,
      verificationStatus,
      adminIdentifier || "operations_admin",
      notes
    );

    return NextResponse.json({ success: true, provider: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update provider status" },
      { status: 500 }
    );
  }
}
