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
    const logs = await RecoveryRepository.listAdminAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
