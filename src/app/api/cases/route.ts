import { NextRequest, NextResponse } from "next/server";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { CreateCaseInput } from "@/lib/recovery-cases/types";
import { getSessionIdentifier, isRequestAdmin } from "@/lib/auth/roles";
import { DELHI_CANDIDATE_PROVIDERS } from "@/lib/constants/delhi-candidates";
import { evaluatePhoneResaleOffers } from "@/lib/resale/engine";
import { PHONE_CATALOG, PHONE_BRANDS } from "@/lib/resale/catalog";
import { PhoneBrand, PhoneCondition, PhoneAccessory } from "@/lib/resale/types";

const VALID_PATHWAYS = [
  "sell-cash",
  "exchange",
  "exchange-voucher",
  "repair",
  "recycle",
  "donate-reuse",
  "refurbishers-parts",
  "parts-harvesting",
];

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
    const sessionId = isAdmin && body.sessionId ? body.sessionId : getSessionIdentifier(request);

    const { pathwayId, providerId, assessmentInput, savedAssessmentId, userNotes } = body;

    // 1. Validate Pathway ID
    if (!pathwayId || typeof pathwayId !== "string") {
      return NextResponse.json(
        { success: false, error: "A recovery pathwayId is required to initiate a recovery case." },
        { status: 400 }
      );
    }
    if (!VALID_PATHWAYS.includes(pathwayId)) {
      return NextResponse.json(
        { success: false, error: `Invalid recovery pathway: '${pathwayId}'.` },
        { status: 400 }
      );
    }

    // 2. Validate Provider Exists and Supports the Requested Pathway
    let matchedProvider = null;
    if (providerId) {
      matchedProvider = DELHI_CANDIDATE_PROVIDERS.find((p) => p.id === providerId);
      if (!matchedProvider) {
        return NextResponse.json(
          { success: false, error: `Invalid provider: Provider '${providerId}' not found in registry.` },
          { status: 400 }
        );
      }

      const services = matchedProvider.services || [];
      if (pathwayId === "sell-cash" && !services.some((s) => s.service_type === "cash_buyback")) {
        return NextResponse.json(
          { success: false, error: `Provider '${matchedProvider.name}' does not support cash buyback transactions.` },
          { status: 400 }
        );
      }
      if (
        (pathwayId === "exchange" || pathwayId === "exchange-voucher") &&
        !services.some((s) => s.service_type === "exchange")
      ) {
        return NextResponse.json(
          { success: false, error: `Provider '${matchedProvider.name}' does not support exchange or trade-in programs.` },
          { status: 400 }
        );
      }
      if (pathwayId === "repair" && !services.some((s) => s.service_type === "repair")) {
        return NextResponse.json(
          { success: false, error: `Provider '${matchedProvider.name}' does not support hardware repair services.` },
          { status: 400 }
        );
      }
      if (pathwayId === "recycle" && !services.some((s) => s.service_type === "recycling")) {
        return NextResponse.json(
          { success: false, error: `Provider '${matchedProvider.name}' does not support certified recycling intake.` },
          { status: 400 }
        );
      }
    }

    // 3. Hazardous Safety Enforcement
    const isHazardousCondition =
      assessmentInput?.condition === "unsafe_hazardous" ||
      assessmentInput?.condition === "hazardous" ||
      assessmentInput?.resalePayload?.condition === "hazardous";

    if (isHazardousCondition) {
      const forbiddenCommercialPathways = [
        "sell-cash",
        "exchange",
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

    // 4. Server-Side Valuation Recalculation & Trust-Boundary Enforcement
    // Never trust client-submitted financial amounts, quotes, or pickup claims.
    let verifiedFinancialValueInr: number | null = null;
    let evidenceNotes: string | null = null;

    const resalePayload = assessmentInput?.resalePayload;
    if (resalePayload && typeof resalePayload === "object") {
      const brand = resalePayload.brand as PhoneBrand;
      const modelId = resalePayload.modelId as string;
      const storage = (resalePayload.storage as string) || "128GB";
      const condition = resalePayload.condition as PhoneCondition;
      const selectedFaults = Array.isArray(resalePayload.selectedFaults)
        ? (resalePayload.selectedFaults as string[])
        : [];
      const accessories = Array.isArray(resalePayload.accessories)
        ? (resalePayload.accessories as PhoneAccessory[])
        : [];
      const pincode = typeof assessmentInput?.pincode === "string" ? assessmentInput.pincode.trim() : "";

      // Validate inputs against catalog bounds
      if (!PHONE_BRANDS.includes(brand)) {
        return NextResponse.json(
          { success: false, error: `Invalid brand: '${brand}'. Must be a supported catalog brand.` },
          { status: 400 }
        );
      }
      const matchedCatalogModel = PHONE_CATALOG.find((m) => m.id === modelId);
      if (!matchedCatalogModel) {
        return NextResponse.json(
          { success: false, error: `Invalid model: '${modelId}' not found in hardware catalog.` },
          { status: 400 }
        );
      }
      if (pincode && !/^\d{6}$/.test(pincode)) {
        return NextResponse.json(
          { success: false, error: `Invalid pincode format: '${pincode}'. Must be 6 digits.` },
          { status: 400 }
        );
      }

      // Recalculate deterministic valuation on the server
      const serverValuation = evaluatePhoneResaleOffers({
        brand,
        modelId,
        modelName: matchedCatalogModel.name,
        storage,
        condition,
        selectedFaults,
        accessories,
        pincode,
      });

      if (providerId) {
        const matchingOffer = serverValuation.offers.find((o) => o.providerId === providerId);
        if (!matchingOffer) {
          return NextResponse.json(
            {
              success: false,
              error: `Provider '${matchedProvider?.name || providerId}' does not have an eligible offer for ${brand} ${matchedCatalogModel.name} in '${condition}' condition.`,
            },
            { status: 400 }
          );
        }
        if (!matchingOffer.isEligible) {
          return NextResponse.json(
            {
              success: false,
              error: `Ineligible selection: ${matchingOffer.ineligibilityReason || "Provider does not accept this device condition."}`,
            },
            { status: 400 }
          );
        }

        // Authoritatively assign server-recalculated net payout
        verifiedFinancialValueInr = matchingOffer.estimatedNetPayout;
        evidenceNotes = JSON.stringify({
          serverRecalculated: true,
          recalculatedAt: new Date().toISOString(),
          quoteStatus: matchingOffer.quoteStatus,
          quoteBasis: matchingOffer.quoteBasis,
          financialType: matchingOffer.financialType,
          pickupBadgeStatus: matchingOffer.pickupBadgeStatus,
          priceRange: matchingOffer.priceRange,
          lastVerifiedDate: matchingOffer.lastVerifiedDate,
          providerSlug: matchingOffer.providerSlug,
        });
      } else {
        // P2P / generic self-managed offer
        const p2pOffer = serverValuation.offers.find((o) => o.offerType === "p2p_market");
        verifiedFinancialValueInr = p2pOffer ? p2pOffer.estimatedNetPayout : serverValuation.assessmentSummary.estimatedNetBaseline;
        evidenceNotes = JSON.stringify({
          serverRecalculated: true,
          recalculatedAt: new Date().toISOString(),
          quoteStatus: "indicative_estimate",
          financialType: "p2p_cash",
          isP2PBenchmark: true,
        });
      }
    } else if (typeof body.financialValueInr === "number") {
      // General non-phone assessment
      if (body.financialValueInr < 0 || body.financialValueInr > 10000000) {
        return NextResponse.json(
          { success: false, error: "Invalid financialValueInr: Must be between 0 and 10,000,000." },
          { status: 400 }
        );
      }
      verifiedFinancialValueInr = Math.round(body.financialValueInr);
    }

    const input: CreateCaseInput = {
      sessionId,
      pathwayId,
      providerId: providerId || null,
      assessmentInput,
      savedAssessmentId,
      userNotes,
      evidenceNotes: evidenceNotes || undefined,
      financialValueInr: verifiedFinancialValueInr,
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
