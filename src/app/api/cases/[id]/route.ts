import { NextRequest, NextResponse } from "next/server";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { CaseTransitionRequest } from "@/lib/recovery-cases/types";
import { isRequestAdmin, getSessionIdentifier } from "@/lib/auth/roles";
import { InvalidStatusTransitionError } from "@/lib/recovery-cases/state-machine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseDetails = await RecoveryRepository.getCaseWithDetails(id);

    if (!caseDetails) {
      return NextResponse.json(
        { success: false, error: `Recovery case '${id}' not found.` },
        { status: 404 }
      );
    }

    // Ownership check: regular users can only read their own case
    const isAdmin = isRequestAdmin(request);
    const sessionId = getSessionIdentifier(request);
    const isDemoAllowed = process.env.NODE_ENV !== "production" && caseDetails.session_id === "demo-session-user";

    if (!isAdmin && caseDetails.session_id !== sessionId && !isDemoAllowed) {
      return NextResponse.json(
        { success: false, error: "Access denied. You do not have permission to view this recovery case." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, case: caseDetails });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch case details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingCase = await RecoveryRepository.getCaseWithDetails(id);
    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: `Recovery case '${id}' not found.` },
        { status: 404 }
      );
    }

    const isAdmin = isRequestAdmin(request);
    const sessionId = getSessionIdentifier(request);

    // Ownership check: regular users can only modify their own case
    const isDemoAllowed = process.env.NODE_ENV !== "production" && existingCase.session_id === "demo-session-user";
    if (!isAdmin && existingCase.session_id !== sessionId && !isDemoAllowed) {
      return NextResponse.json(
        { success: false, error: "Access denied. You cannot modify a case belonging to another session." },
        { status: 403 }
      );
    }

    // Role enforcement: Users cannot declare themselves admins or self-confirm provider verification
    let actorRole: "user" | "admin" = "user";
    let isProviderConfirmed = false;

    if (isAdmin) {
      actorRole = "admin";
      isProviderConfirmed = Boolean(body.isProviderConfirmed);
    }

    const transitionRequest: CaseTransitionRequest = {
      targetStatus: body.targetStatus,
      changedByRole: actorRole,
      reasonOrNotes: body.reasonOrNotes,
      isProviderConfirmed,
      outcomeType: body.outcomeType,
      financialValueInr: body.financialValueInr !== undefined ? Number(body.financialValueInr) : undefined,
      evidenceNotes: body.evidenceNotes,
      evidenceUrl: body.evidenceUrl,
      newProviderId: body.newProviderId,
    };

    const updatedCase = await RecoveryRepository.transitionCase(id, transitionRequest);

    return NextResponse.json({ success: true, case: updatedCase });
  } catch (err) {
    if (err instanceof InvalidStatusTransitionError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
          fromStatus: err.fromStatus,
          toStatus: err.toStatus,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update case status" },
      { status: 500 }
    );
  }
}
